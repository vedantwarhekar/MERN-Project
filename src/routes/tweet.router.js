import { Router } from "express";

import {
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT, createTweet);

router.route("/get-user-tweet/:userId").get(verifyJWT, getUserTweets);

router.route("/update-tweet/:tweetid").put(verifyJWT, updateTweet);

router.route("/delete-tweet/:tweetId").delete(verifyJWT, deleteTweet);

export default router;
