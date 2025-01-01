import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router
  .route("/subscribe-Channels/:channelId")
  .post(verifyJWT, toggleSubscription);

router
  .route("/get-user-channel-subscribers/:channelId")
  .get(verifyJWT, getUserChannelSubscribers);

router
  .route("/get-subscribed-channels/:subscriberId")
  .get(verifyJWT, getSubscribedChannels);

export default router;
