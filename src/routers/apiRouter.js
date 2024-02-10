import express from "express";
import {
    registerView,
    createComment,
    deleteComment,
} from "../controllers/videoController";

const apiRouter = express.Router();

apiRouter.post("/videos/:id([0-9a-f]{24})/view", registerView);
apiRouter.get("/videos/:id([0-9a-f]{24})/view", (req, res) =>
    res.status(200).send(`view Get Test ${req.params.id}`)
);
apiRouter.get("/test", (req, res) => {
    res.status(200).send("test");
});

apiRouter.post("/videos/:id([0-9a-f]{24})/comment", createComment);
// apiRouter.delete("/videos/:id([0-9a-f]{24})/comment", deleteComment);
apiRouter.delete(
    "/videos/:videoId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})",
    deleteComment
);
apiRouter.get(
    "/videos/:videoId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})",
    (req, res) => {
        res.status(200).send(
            `comment Get Test ${req.params.videoId} ${req.params.commentId}`
        );
    }
);
// apiRouter.get(
//     "/videos/:videoId([0-9a-f]{24})/comment/:commentId([0-9a-f]{24})",
//     (req, res) => {
//         res.status(200).send("comment Get Test " + req.params.videoId + " " + req.params.commentId);
//     }
// );

export default apiRouter;
