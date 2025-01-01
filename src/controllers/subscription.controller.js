import { Subscryption } from "../models/subscryption.model.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";

const toggleSubscription = asynchandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiErrors(403, "Please provide a valid user id");
  }

  const user = await User.findById(channelId);

  if (!user) {
    throw new ApiErrors(404, "Channel Not found");
  }

  const existingSubscription = await Subscryption.findOne({
    subscryber: req.user._id,
    channel: channelId,
  });

  if (existingSubscription) {
    await Subscryption.findByIdAndDelete(existingSubscription._id);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "subscryption removed successfully"));
  }

  try {
    const subscribe = await Subscryption.create({
      subscryber: req.user._id,
      channel: channelId,
    });
    if (!subscribe) {
      throw new ApiErrors(400, "Error while subscribing");
    }
    return res
      .status(201)
      .json(new ApiResponse(201, subscribe, "Channel Subsribed successfully"));
  } catch (error) {
    console.log("error while subscrybing :- ", error);
    throw new ApiErrors(500, "an unexcepted error occured!");
  }
});

const getUserChannelSubscribers = asynchandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId || !isValidObjectId(channelId)) {
    throw new ApiErrors(403, "Please provide a valid channel id");
  }

  const channelSubscribers = await Subscryption.find({ channel: channelId });

  if (!channelSubscribers.length) {
    return res
      .status(404)
      .json(
        new ApiResponse(404, null, "No subscribers found for this channel")
      );
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubscribers,
        "Channel subscribers found successfully"
      )
    );
});

const getSubscribedChannels = asynchandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId || !isValidObjectId(subscriberId)) {
    throw new ApiErrors(403, "Please provide a valid subscriber id");
  }

  const subscribedChannels = await Subscryption.find({
    subscryber: subscriberId,
  });

  if (!subscribedChannels.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No subscribed channels found for You"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "subscribed channels found successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
