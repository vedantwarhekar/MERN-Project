import { ApiErrors } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynchandler } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();
export const verifyJWT = asynchandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    if (!token) {
      throw ApiErrors(401, "Unathorizsed request");
    }

    const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = User.findById(decodeToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      //TODO
      throw ApiErrors(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw ApiResponse(401, error?.message || "Invalid Access Token");
  }
});
