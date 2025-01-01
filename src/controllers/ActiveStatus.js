import { asynchandler } from "../utils/asynchandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const activeStatus = asynchandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, null, "yes Active"));
});

export { activeStatus };
