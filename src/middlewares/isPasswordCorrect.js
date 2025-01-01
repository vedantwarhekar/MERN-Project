import { asynchandler } from "../utils/asynchandler";
import { ApiErrors } from "../utils/ApiErrors";
import { User } from "../models/user.model";

const isPasswordCorrect = asynchandler(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    throw new ApiErrors(400, "Passwor is missing bro");
  }

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new ApiErrors(401, "Invalid password");
  }
  next();
});

export { isPasswordCorrect };
