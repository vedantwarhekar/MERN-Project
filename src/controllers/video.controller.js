import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const publishVideo = asynchandler(async (req, res) => {
  const { title, isPublished = false, description } = req.body;

  if (!title || !description) {
    throw new ApiErrors(400, "Title and description are required.");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiErrors(400, "Both video file and thumbnail are required.");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoFile?.url || !thumbnail?.url) {
    throw new ApiErrors(400, "Error while uploading files to Cloudinary.");
  }

  const duration = videoFile.duration || 0;

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    isPublished,
    duration,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, video, "Video uploaded successfully"));
});

const getAllVideos = asynchandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query = "",
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  if (pageNum <= 0 || limitNum <= 0) {
    throw new ApiErrors(400, "Page and Limit should be greater than 0");
  }

  const filter = {
    ...(userId && { owner: userId }),
    ...(query && {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    }),
  };

  const sortOptions = {
    [sortBy]: sortType === "desc" ? -1 : 1,
  };

  const videos = await Video.find(filter)
    .sort(sortOptions)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  const totalVideos = await Video.countDocuments(filter);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalVideos / limitNum),
          totalVideos,
        },
      },
      "Videos fetched successfully"
    )
  );
});

const getVideoById = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(400, "Video not found with the given ID");
  }

  return res.status(200).json({
    success: true,
    data: video,
    message: "video fetched successfully",
  });
});

const updateVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video id");
  }

  const videoOwner = await Video.findById(videoId);

  if (!videoOwner) {
    throw new ApiErrors(404, "Video not found with this id");
  }

  if (String(videoOwner.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to modify the video");
  }

  //TODO: update video details like title, description, thumbnail
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;

  if (!title || !description || !thumbnailLocalPath) {
    throw new ApiErrors(400, "All the fileds are required");
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail?.url) {
    throw new ApiErrors(401, "Error while uploading thumbnail image");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: thumbnail.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});

const deleteVideo = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video id");
  }

  const videoOwner = await Video.findById(videoId);

  if (!videoOwner) {
    throw new ApiErrors(404, "Video not found with this ID");
  }
  if (String(videoOwner.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to modify the video");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Video Deleted Successfully"));
});

const togglePublishStatus = asynchandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video id");
  }

  const videoOwner = await Video.findById(videoId);

  if (!videoOwner) {
    throw new ApiErrors(404, "Video not found with this ID");
  }

  if (String(videoOwner.owner) !== String(req.user._id)) {
    throw new ApiErrors(400, "You are not authorized to modify the video");
  }

  const video = await Video.findByIdAndUpdate(
    videoId,
    { $set: { isPublished: !videoOwner.isPublished } },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "video updated successfully"));
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
