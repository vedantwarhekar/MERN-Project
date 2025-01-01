import { Tweet } from "../models/tweet.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isValidObjectId } from "mongoose";

const createTweet = asynchandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiErrors(400, "Content cannot be empty!");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user._id,
  });

  if (!tweet) {
    throw new ApiErrors(400, "Error while creating tweet");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, tweet, "Tweet created successfully"));
});

const getUserTweets = asynchandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiErrors(400, "Please provide a valid user id");
  }

  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  const tweets = await Tweet.find({ owner: userId })
    .sort({ createdAt: -1 })
    .skip((pageNumber - 1) * limitNumber)
    .limit(limitNumber);

  const totalTweets = await Tweet.countDocuments({ owner: userId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tweets,
        totalTweets,
        totalPages: Math.ceil(totalTweets / limitNumber),
        currnetPage: pageNumber,
      },
      "Tweet's retrieved successfully "
    )
  );
});

const updateTweet = asynchandler(async (req, res) => {
  const { tweetid } = req.params;
  const { content } = req.body;

  if (!tweetid || !isValidObjectId(tweetid)) {
    throw new ApiErrors(400, "Please provide a valid tweet id");
  }

  if (!content) {
    throw new ApiErrors(400, "Content cannot be empty");
  }

  const tweet = await Tweet.findById(tweetid);

  if (!tweet) {
    throw new ApiErrors(404, "Tweet not found with this id");
  }

  if (String(tweet.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to modify this tweet");
  }

  const newTweet = await Tweet.findByIdAndUpdate(
    tweetid,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, newTweet, "Tweet updated successfully"));
});

const deleteTweet = asynchandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId || !isValidObjectId(tweetId)) {
    throw new ApiErrors(400, "Please provide a valid tweet id");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiErrors(404, "Tweet not found with this id");
  }
  if (String(tweet.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to delete this tweet");
  }

  await Tweet.findByIdAndDelete(tweetId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
