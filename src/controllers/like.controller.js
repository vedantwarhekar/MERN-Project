import { isValidObjectId } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(404, "Video not found with this id");
  }

  //first we have to check the like is alredy exists or not
  const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Liked removed successfully"));
  }

  //if existing like is not exists that means we have to create the new like
  const newLike = await Like.create({ video: videoId, likedBy: userId });

  return res
    .status(201)
    .json(new ApiResponse(201, newLike, "Video Like Successfully"));
});

const toggelCommentLike = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiErrors(400, "Please provide a valid comment id");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiErrors(404, "Comment not found with this id");
  }

  // as we cheack in like section first we have to cheack for existing comment like
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment liked removed successfully"));
  }

  // if existingLike not exists that means we have to create new Like
  const newCommentLike = await Like.create({
    comment: commentId,
    likedBy: userId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newCommentLike, "Comment Like Successfully"));
});

const toggleTweetLike = asynchandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiErrors(400, "Please provide a valid tweet id");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiErrors(404, "Tweet not found with this id");
  }

  const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet liked removed successfully"));
  }

  const newTweetLike = await Like.create({ tweet: tweetId, likedBy: userId });

  return res
    .status(201)
    .json(new ApiResponse(201, newTweetLike, "Tweet Like Successfully"));
});

const getLikedVideos = asynchandler(async (req, res) => {
  const userid = req.user._id;

  const likedVideos = await Like.find({ likedBy: userid }).populate("video");

  if (likedVideos.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No liked video found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "found your liked videos"));
});

export { toggleVideoLike, toggelCommentLike, toggleTweetLike, getLikedVideos };
