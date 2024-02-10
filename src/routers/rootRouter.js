import express from "express";
import {
    getJoin,
    postJoin,
    getLogin,
    postLogin,
    postLogout,
} from "../controllers/userController";
import { home, search } from "../controllers/videoController";
import { protectorMiddleware } from "../middlewares";
import { publicOnlyMiddleware } from "../middlewares";

const rootRouter = express.Router();

//handler = controller

rootRouter.get("/", home);
rootRouter.route("/join").all(publicOnlyMiddleware).get(getJoin).post(postJoin);
rootRouter
    .route("/login")
    .all(publicOnlyMiddleware)
    .get(getLogin)
    .post(postLogin);
rootRouter.route("/logout").all(protectorMiddleware).post(postLogout);
rootRouter.get("/search", search);
rootRouter.get("/test", (req, res) => {
    res.status(200).send("test");
});

export default rootRouter;
