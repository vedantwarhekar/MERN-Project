import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const genrateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshTokens = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiErrors(
      500,
      "something wrong while genrtaing access or refresh token"
    );
  }
};

const registerUser = asynchandler(async (req, res) => {
  // Algorithum for registred user
  // 1) get user details from frontend
  // 2) validation of data
  // 3) check if alredy exits the user through : username,email
  // 4) check for image, check for avtar
  // 5) upload them to cloudinary avtar
  // 6) create user object - create entry in db
  // 7) remove password and refresh toke fields from response
  // 8) check for user creation
  // 9) return user

  // get user details from frontend
  const { fullName, email, userName, password } = req.body;

  //validation of data
  if (
    [fullName, email, userName, password].some((filed) => filed?.trim() === "")
  ) {
    throw new ApiErrors(400, "All fields are required");
  }

  // check if alredy exits the user through : username,email
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    throw new ApiErrors(409, "User with username and email alredy exits");
  }

  //check for image, check for avtar
  const avtarLocatpath = req.files?.avatar?.[0]?.path;
  const coverImageLocalpath = req.files?.coverImage?.[0]?.path;

  if (!avtarLocatpath) {
    throw new ApiErrors(400, "avatar localpath is required");
  }

  //upload them to cloudinary avtar
  const avatar = await uploadOnCloudinary(avtarLocatpath);
  const coverImage = await uploadOnCloudinary(coverImageLocalpath);

  if (!avatar) {
    throw new ApiErrors(400, "avatar file is required ");
  }

  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  //remove password and refresh toke fields from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiErrors(400, "somethis went wrong while regestering the user");
  }

  // return user
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "user Regestred Successfully"));
});

const loginUser = asynchandler(async (req, res) => {
  // req data from body
  // username or email one of this to login
  // find the user
  // password cheack
  // access and refresh token
  //send cookie

  // req data from body
  const { email, password, userName } = req.body;
  console.log(email);
  // username or email one of this to login
  if (!userName && !email) {
    throw new ApiErrors(401, "username or email is required");
  }

  // find the user
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiErrors(401, "User not found");
  }

  // password cheack
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiErrors(401, "Incorrect Password");
  }

  // access and refresh token
  const { accessToken, refreshToken } = await genrateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //send cookie
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

const logOutUser = asynchandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asynchandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiErrors(401, "Unathorized request");
  }
  try {
    const decodeToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRES_TOKEN_SECRET
    );

    const user = await User.findById(decodeToken._id);

    if (!user) {
      throw new ApiErrors(401, "Invalid Refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiErrors(401, "refresh token is expired or alredy in use");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newrefreshToken } = await genrateAccessAndRefreshToken(
      user._id
    );
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newrefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newrefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiErrors(401, error?.message || "Invalid refresh token");
  }
});

const changeCurrentPassword = asynchandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword && !newPassword) {
    throw new ApiErrors(401, "old Password or current password is empty");
  }

  const user = await User.findById(req, user?._id);

  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiErrors(401, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password change succefully"));
});

const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "current user fetched successfully");
});

const updateAccountDetails = asynchandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiErrors(400, "All the fileds are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updates succefully"));
});

const updateUserAvatar = asynchandler(async (req, res) => {
  // i need to take avatar file from user
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiErrors(401, "Avatar local path not found");
  }

  //upload on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiErrors(401, "Error while uploading avatr file");
  }

  // need to find the user and update it
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "avatr image updated successfully"));
});

const upadateCoverImage = asynchandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  // Delete old image assingment

  if (!coverImageLocalPath) {
    throw new ApiErrors(401, "cover image not found");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiErrors(401, "Error while uploading cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover Image upadated successfully"));
});

const getUserChannelProfile = asynchandler(async () => {
  const { userName } = req.params;

  if (!userName?.trim()) {
    throw new ApiErrors(400, "user name is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscryptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscrybers",
      },
    },
    {
      $lookup: {
        from: "subscryptions",
        localField: "_id",
        foreignField: "subscryber",
        as: "subscrybedTo",
      },
    },
    {
      $addFields: {
        subscryberCount: {
          $size: "$subscrybers",
        },
        channelsubscryebdToCount: {
          $size: "$subscrybedTo",
        },
        isSubscryed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscrybers.subscryber"] },
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        userName: 1,
        email: 1,
        subscryberCount: 1,
        channelsubscryebdToCount: 1,
        avatar: 1,
        coverImage: 1,
        isSubscryed: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User channel subscryebd"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  updateAccountDetails,
  updateUserAvatar,
  upadateCoverImage,
  getUserChannelProfile,
};
