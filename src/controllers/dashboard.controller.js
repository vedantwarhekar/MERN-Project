import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getChannelStates = asynchandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
});

const getChannelVideos = asynchandler(async (req, res) => {});

export { getChannelStates, getChannelVideos };
