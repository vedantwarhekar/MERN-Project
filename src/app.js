import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// genrally for importing the route code we write import statement here
import ActiveStatus from "./routes/Activestatus.route.js";
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import likeRouter from "./routes/like.routes.js";
import commentRouter from "./routes/comment.routes.js";
import TweetRouter from "./routes/tweet.router.js";
import SubscryptionRouter from "./routes/subscryption.route.js";
import PlaylistRouter from "./routes/playlist.routes.js";

app.use("/api/v1/active-status", ActiveStatus);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/tweet", TweetRouter);
app.use("/api/v1/subscryption", SubscryptionRouter);
app.use("/api/v1/playlist", PlaylistRouter);

export { app };
