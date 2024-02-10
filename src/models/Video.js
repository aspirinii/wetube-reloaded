import mongoose from "mongoose";

export const formatHashtags = (hashtags) =>
    hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));

const videoSchema = new mongoose.Schema({
    videoUrl: { type: String, required: true },
    title: {
        type: String,
        required: true,
        maxLength: 80,
        minLength: 1,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100,
        minLength: 0,
    },
    createdAt: { type: Date, required: true, default: Date.now },
    hashtags: [{ type: String, trim: true }],
    meta: {
        views: { type: Number, default: 0, required: true },
        //default:0 means if there is no views, it will be 0.. required: actually it is not required but default is setted
        rating: { type: Number, default: 0, required: true },
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Comment",
        },
    ],
    // ref:"User" means this owner is from User model
});

videoSchema.static("formatHashtags", function (hashtags) {
    return hashtags
        .split(",")
        .map((word) => (word.startsWith("#") ? word : `#${word}`));
});

const Video = mongoose.model("Video", videoSchema);
export default Video;
