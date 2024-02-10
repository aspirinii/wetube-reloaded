import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

console.log(process.env.NODE_ENV);

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ID,
        secretAccessKey: process.env.AWS_SECRET,
    },
    region: "ap-northeast-1",
});

//delete file from s3 add deleteObject function

const s3ImageUploader = multerS3({
    s3: s3,
    bucket: "kpoptube",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // bucket 안에 folder 속에 file 분류하기
    key: function (request, file, ab_callback) {
        const newFileName = Date.now() + "-" + file.originalname;
        const fullPath = "images/" + newFileName;
        ab_callback(null, fullPath);
    },
});

const s3VideoUploader = multerS3({
    s3: s3,
    bucket: "kpoptube",
    acl: "public-read",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // bucket 안에 folder 속에 file 분류하기
    key: function (request, file, ab_callback) {
        const newFileName = Date.now() + "-" + file.originalname;
        const fullPath = "videos/" + newFileName;
        ab_callback(null, fullPath);
    },
});

export const avatarUpload = multer({
    dest: "uploads/images/",
    limits: {
        fileSize: 3000000,
    },
    storage: s3ImageUploader,
});
export const videoUpload = multer({
    dest: "uploads/videos/",
    limits: { fileSize: 10000000 },
    storage: s3VideoUploader,
});

export const localMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);

    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {};

    next();
};

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not Logged In");
        return res.redirect("/login");
    }
};

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        req.flash("error", "Not authorized");
        return res.redirect("/");
    }
};
