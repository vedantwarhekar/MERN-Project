import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlayList,
  addVideoToPlaylist,
  deletePlaylist,
  updatePlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
  getPlaylistById,
} from "../controllers/playList.controller.js";

const router = Router();

router.route("/create-playlist").post(verifyJWT, createPlayList);

router
  .route("/add-video-to-playlist/:playlistId/:videoId")
  .post(verifyJWT, addVideoToPlaylist);

router.route("/delete-playlist/:playlistId").delete(verifyJWT, deletePlaylist);

router.route("/update-playlist/:playlistId").put(verifyJWT, updatePlaylist);

router
  .route("/remove-video-from-playlist/:playlistId/:videoId")
  .delete(verifyJWT, removeVideoFromPlaylist);

router.route("/get-user-playlists").get(verifyJWT, getUserPlaylists);

router.route("/get-playlist-by-id/:playlistId").get(verifyJWT, getPlaylistById);

export default router;
