import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

export { registerUser };
