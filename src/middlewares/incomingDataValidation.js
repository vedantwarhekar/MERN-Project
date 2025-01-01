import Joi from "joi";
import { asynchandler } from "../utils/asynchandler.js";
import { ApiErrors } from "../utils/ApiErrors.js";

const userValidation = asynchandler(async (req, res, next) => {
  const schema = Joi.object({
    userName: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().lowercase().trim(),
    fullName: Joi.string().min(4).max(100).required(),
    password: Joi.string().min(4).max(20).required(),
    coverImage: Joi.string().optional().allow(null, ""),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    throw new ApiErrors(400, "Bad request", error.details[0].message);
  }

  if (!req.files || !req.files.avatar) {
    throw new ApiErrors(401, "Avatar file is required");
  }

  next();
});

export { userValidation };
