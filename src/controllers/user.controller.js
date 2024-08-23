import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
export { registerUser, loginUser, logOutUser };
