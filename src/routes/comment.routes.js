import { Router } from "express";

import {
  addComment,
  getVideoComments,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/get-all-video-comment/:videoId")
  .get(verifyJWT, getVideoComments);

router.route("/add-commnt/:videoId").post(verifyJWT, addComment);

router.route("/update-comment/:commentId").patch(verifyJWT, updateComment);

router.route("/delete-comment/:commentId").delete(verifyJWT, deleteComment);

export default router;
