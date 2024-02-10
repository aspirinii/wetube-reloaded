// Desc: server setting
import express from "express";
import session from "express-session";
import morgan from "morgan";
import rootRouter from "./routers/rootRouter";
import userRouter from "./routers/userRouter";
import videoRouter from "./routers/videoRouter";
import apiRouter from "./routers/apiRouter";
import { localMiddleware } from "./middlewares";
import MongoStore from "connect-mongo";
import flash from "express-flash";

//live server
// var livereload = require("livereload");
// var connectLiveReload = require("connect-livereload");

const app = express(); // app means application server
const logger = morgan("dev");

// live server
// const liveReloadServer = livereload.createServer();
// liveReloadServer.server.once("connection", () => {
//     setTimeout(() => {
//         liveReloadServer.refresh("/");
//     }, 100);
// });
// app.use(connectLiveReload());

//check cwd : current working directory
console.log(process.cwd());

//set View Engine
app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");

// middleware
app.use(logger);
app.use(express.urlencoded({ extended: true }));
// express.urlencoded : middleware that parse incoming request with urlencoded payload
app.use(express.json()); // express.json : middleware that parse incoming request with json payload


// session middleware
app.use(
    session({
        secret: process.env.COOKIE_SECRET, // 암호화 signature protect from cookie tampering
        resave: false, // 세션을 강제로 저장
        saveUninitialized: false, // 세션을 수정하지 않아도 저장
        cookie: {
            // maxAge: 2000, test
        },
        store: MongoStore.create({ mongoUrl: process.env.DB_URL }),
    })
);
// flash middleware
app.use(flash());
// local middleware
app.use(localMiddleware);

// router
app.use("/uploads", express.static("uploads")); // express.static : directory에서 file을 보내주는 middleware
app.use("/static", express.static("assets")); // express.static : directory에서 file을 보내주는 middleware
app.use("/", rootRouter);
app.use("/users", userRouter);
app.use("/videos", videoRouter);
app.use("/api", apiRouter);

export default app;
