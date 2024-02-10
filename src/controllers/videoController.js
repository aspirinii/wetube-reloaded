import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";
import fs from "fs/promises";

export const home = async (req, res) => {
    try {
        const videos = await Video.find({})
            .sort({ createdAt: "desc" })
            .populate("owner"); // wait until database is done
        // mongoose will find all videos
        return res.render("home", { pageTitle: "Home", videos });
    } catch (error) {
        console.log(error);
        return res.render("server-error");
    }
};
export const watch = async (req, res) => {
    try {
        const id = req.params.id;
        // const video = await Video.find({_id: id}); // -> it find all videos that has id array ??
        const videoFoundedById = await Video.findById(id)
            .populate("owner")
            .populate({
                path: "comments",
                populate: {
                    path: "owner",
                    model: "User", // Assuming the model name is 'User'
                },
            });
        // .populate("owner") means it will find owner from User model
        // owner is from videoSchema ref:"User"
        console.log(videoFoundedById);
        // const videoOwner = await User.findById(videoFoundedById.owner._id);
        // console.log(videoOwner);
        return res.render("watch", {
            pageTitle: `Watching : ${videoFoundedById.title}`,
            video: videoFoundedById,
            // videoOwner: videoOwner,
        });
    } catch (error) {
        console.log(error);
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
};
export const getEdit = async (req, res) => {
    if (!req.session.loggedIn) {
        req.flash("error", "Not authorized");
        return res.redirect("/login");
    }
    try {
        const id = req.params.id;
        const videoFoundById = await Video.findById(id).populate("owner");
        if (videoFoundById.owner._id.toString() !== req.session.user._id) {
            req.flash("error", "You are not the owner of the video.");
            return res.status(403).redirect("/");
        }
        return res.render("edit", {
            pageTitle: `Edit  :`,
            video: videoFoundById,
        });
    } catch (error) {
        req.flash("error", "Video not found.");
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
};
export const postEdit = async (req, res) => {
    try {
        const { title, description, hashtags } = req.body;
        const { id } = req.params;
        const videoFoundById = await Video.findById(id).populate("owner");
        if (videoFoundById.owner._id.toString() !== req.session.user._id) {
            return res.status(403).redirect("/");
        }

        if (!videoFoundById) {
            return res
                .status(404)
                .render("404", { pageTitle: "Video not found." });
        }
        await Video.findByIdAndUpdate(id, {
            title: title,
            description,
            hashtags: Video.formatHashtags(hashtags),
        });
        req.flash("success", "Changes saved.");
        return res.redirect(`/videos/${id}`);
    } catch (error) {
        console.log(error);
        return res.status(404).render("404", { pageTitle: "Video not found." });
    }
};

export const getUpload = (req, res) => {
    return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
    const {
        user: { _id },
    } = req.session;
    const {
        body: { title, description, hashtags },
        file,
    } = req;
    console.log("req.file :", req.file);
    console.log("file.path :", file.path);
    try {
        const newVideo = await Video.create({
            //Video is model of mongoose
            owner: _id,
            videoUrl: file.loaction,
            title: title,
            description: description,
            hashtags: Video.formatHashtags(hashtags),
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        return res.redirect("/");
    } catch (error) {
        return res.render("upload", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};

export const deleteVideo = async (req, res) => {
    const { id } = req.params;
    const videoFoundById = await Video.findById(id).populate("owner");
    if (videoFoundById.owner._id.toString() !== req.session.user._id) {
        console.log(
            "videoFoundById.owner._id :",
            videoFoundById.owner._id,
            "req.session.user._id :",
            req.session.user._id
        );
        return res.status(403).redirect("/");
    }
    // 파일삭제,, 리스트삭제 둘다 동작안함 ㅠㅠ
    // Delete the video file from the file system
    const filePath = videoFoundById.videoUrl; // Assuming videoUrl is the path to the video file
    console.log("filePath :", filePath);
    try {
        await fs.unlink(filePath); // Use try-catch for handling asynchronous operations
        console.log("File deleted successfully");
    } catch (err) {
        console.error("Error deleting file:", err);
    }
    // Assuming owner is a Mongoose document with a videos array
    videoFoundById.owner.videos.pull(id); // This removes the id from the videos array
    await videoFoundById.owner.save(); // Don't forget to save the changes
    await Video.findByIdAndDelete(id);
    return res.redirect("/");
};

export const search = async (req, res) => {
    console.log(req.query);
    const { keyword } = req.query;
    let videos = [];
    if (keyword) {
        videos = await Video.find({
            title: {
                $regex: new RegExp(`${keyword}`, "i"),
                // i means case insensitive
            },
        });
    }
    console.log("keyword: ", keyword);
    console.log("videos: ", videos);
    return res.render("search", { pageTitle: "Search", videos, keyword });
};

export const registerView = async (req, res) => {
    const { id } = req.params;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    video.meta.views = video.meta.views + 1;
    await video.save();
    return res.sendStatus(200);
};

export const createComment = async (req, res) => {
    // console.log("createComment");
    // console.log("req.body" + req.body);
    // console.log("req.body.text" + req.body.text);
    // console.log(req.params);
    // console.log(req.session);
    const {
        session: { user },
        body: { text },
        params: { id },
    } = req;
    const video = await Video.findById(id);
    if (!video) {
        return res.sendStatus(404);
    }
    const comment = await Comment.create({
        text,
        owner: user._id,
        video: id,
    });
    video.comments.push(comment._id);
    await video.save();
    return res.status(201).json({ newCommentId: comment._id });
};

export const deleteComment = async (req, res) => {
    try {
        const { videoId, commentId } = req.params;
        const comment = await Comment.findById(req.params.commentId);
        if (comment.owner.toString() !== req.session.user._id) {
            console.log("comment.owner: ", comment.owner);
            console.log("req.session.user._id: ", req.session.user._id);
            return res.sendStatus(404);
        }

        const video = await Video.findById(videoId);
        if (!video) {
            console.log("video not found");
            return res.sendStatus(404);
        }
        await Comment.findByIdAndDelete(commentId);
        video.comments.pull(commentId);
        await video.save();
        return res.sendStatus(201);
    } catch (error) {
        console.log(error);
        return res.sendStatus(404);
    }
};
