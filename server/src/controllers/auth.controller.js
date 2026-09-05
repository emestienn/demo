import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { signToken } from "../utils/jwt.js";

function issueSession(user) {
  const token = signToken({ sub: user._id.toString(), role: user.role });
  return { token, user: user.toPublicJSON() };
}

export const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
  if (existing) throw ApiError.conflict("Username or email already in use");

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
    displayName: username,
  });

  res.status(201).json({ success: true, data: issueSession(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (user.isSuspended) throw ApiError.forbidden("This account has been suspended");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  res.json({ success: true, data: issueSession(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user.toPublicJSON() });
});
