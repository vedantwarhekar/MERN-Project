import { isValidObjectId } from "mongoose";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";

const createPlayList = asynchandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    throw new ApiErrors(400, "Name and description are required.");
  }

  const playList = await Playlist.create({
    name: name,
    description: description,
    owner: req.user._id,
  });

  if (!playList) {
    throw new ApiErrors(400, "Error while creating playlist");
  }
  return res
    .status(201)
    .json(new ApiResponse(201, playList, "Playlist created sucessfully"));
});

const addVideoToPlaylist = asynchandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiErrors(400, "Please provide a valid playlist ID.");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video ID.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found with this ID.");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiErrors(404, "Video not found with this ID.");
  }

  if (playlist.videos.includes(videoId)) {
    throw new ApiErrors(400, "Video is already in the playlist.");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "Video Added successfully in playlist")
    );
});

const deletePlaylist = asynchandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiErrors(400, "Please provide a valid playlist ID.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found with the provided ID.");
  }

  if (String(playlist.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to delete this playlist.");
  }

  await Playlist.findByIdAndDelete(playlist._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Playlist Deleted successfully"));
});

const updatePlaylist = asynchandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiErrors(400, "Please provide a valid playlist ID.");
  }

  if (!name || !description) {
    throw new ApiErrors(
      400,
      "Please provide both name and description to modify."
    );
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found with the provided ID.");
  }

  if (String(playlist.owner) !== String(req.user._id)) {
    throw new ApiErrors(403, "You are not authorized to modify this playlist.");
  }

  const newPlaylist = await Playlist.findByIdAndUpdate(
    playlist._id,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, newPlaylist, "Playlist updated successfully"));
});

const removeVideoFromPlaylist = asynchandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiErrors(400, "Please provide a valid playlist ID.");
  }
  if (!videoId || !isValidObjectId(videoId)) {
    throw new ApiErrors(400, "Please provide a valid video ID.");
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found with this ID.");
  }

  if (!playlist.videos.includes(videoId)) {
    throw new ApiErrors(400, "Video is not in the playlist.");
  }

  playlist.videos.pull(videoId);
  await playlist.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos: playlist.videos },
        "Video Removed successfully!"
      )
    );
});

const getUserPlaylists = asynchandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId || !isValidObjectId(userId)) {
    throw new ApiErrors(400, "Please provide a valid user ID.");
  }

  const userPlaylists = await Playlist.find({ owner: userId });

  if (userPlaylists.length === 0) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "No playlists found for this user."));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, userPlaylists, "PlayList's retrieved successfully")
    );
});

const getPlaylistById = asynchandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!playlistId || !isValidObjectId(playlistId)) {
    throw new ApiErrors(400, "Please provide a valid playlist ID.");
  }

  const playLists = await Playlist.findById(playlistId);

  if (!playLists) {
    throw new ApiErrors(404, "Playlist not exists.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playLists, "PlayList's retrieved successfully"));
});

export {
  createPlayList,
  addVideoToPlaylist,
  deletePlaylist,
  updatePlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
  getPlaylistById,
};
