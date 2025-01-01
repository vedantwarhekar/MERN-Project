import { isValidObjectId } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";

const addComment = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video ID");
  }
  if (!content) {
    throw new ApiErrors(400, "Content cannot be empty");
  }

  const userId = req.user._id;
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(404, "Video not found");
  }

  const newComment = await Comment.create({
    content: content,
    video: videoId,
    owner: userId,
  });

  if (!newComment) {
    throw new ApiErrors(400, "Error while creating the comment");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment created successfully"));
});

const updateComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiErrors(400, "Please provide a valid comment id");
  }

  if (!content) {
    throw new ApiErrors(400, "Content cannot be empty");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiErrors(404, "Comment not found with this id");
  }

  if (String(comment.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to modify this comment");
  }

  const newComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: content,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, newComment, "Comment updated successfully"));
});

const deleteComment = asynchandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId || !isValidObjectId(commentId)) {
    throw new ApiErrors(400, "Please provide a valid comment id");
  }

  const commentOwner = await Comment.findById(commentId);

  if (!commentOwner) {
    throw new ApiErrors(404, "Comment not found with this id");
  }
  if (String(commentOwner.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to modify the comment");
  }

  await Comment.findByIdAndDelete(commentId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

const getVideoComments = asynchandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !isValidObjectId) {
    throw new ApiErrors(400, "Invalid Video id");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiErrors(404, "Please provide the valid Video Id");
  }

  const overallComment = await Comment.find({ video: videoId })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort({ createdAt: -1 })
    .populate("owner", "fullName avatar")
    .exec();

  const total = await Comment.countDocuments({ video: videoId });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        overallComment,
        total,
        page: Number(page),
        limit: Number(limit),
      },
      "comment fetched successfully"
    )
  );
});

export { addComment, deleteComment, updateComment, getVideoComments };
