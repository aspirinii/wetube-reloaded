import express from "express";
import { avatarUpload } from "../middlewares";
import { protectorMiddleware } from "../middlewares";
import { publicOnlyMiddleware } from "../middlewares";
import {
    getUserProfile,
    startGithubLogin,
    finishGithubLogin,
    getProfileEdit,
    postProfileEdit,
    getChangePassword,
    postChangePassword,
} from "../controllers/userController";

const userRouter = express.Router();

userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/callback", publicOnlyMiddleware, finishGithubLogin);
userRouter
    .route("/edit")
    .all(protectorMiddleware)
    .get(getProfileEdit)
    .post(avatarUpload.single("avatar"), postProfileEdit);
userRouter
    .route("/change-password")
    .all(protectorMiddleware)
    .get(getChangePassword)
    .post(postChangePassword);
userRouter.get("/:id", getUserProfile);

export default userRouter;
