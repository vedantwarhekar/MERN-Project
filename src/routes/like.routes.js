import { Router } from "express";
import {
  toggleVideoLike,
  toggelCommentLike,
  toggleTweetLike,
  getLikedVideos,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/toggle-video-like/:videoId").post(verifyJWT, toggleVideoLike);

router
  .route("/toggle-comment-like/:commentId")
  .post(verifyJWT, toggelCommentLike);

router.route("/toggle-tweet-like/:tweetId").post(verifyJWT, toggleTweetLike);

router.route("/get-liked-videos").get(verifyJWT, getLikedVideos);

export default router;
