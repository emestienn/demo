import { User } from "../models/User.js";
import { Place } from "../models/Place.js";
import { Follow } from "../models/Follow.js";
import { Post } from "../models/Post.js";
import { Collection } from "../models/Collection.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { logActivity } from "../services/activity.service.js";
import { checkAndUnlockAchievements } from "../services/gamification.service.js";
import { createNotification } from "../services/notification.service.js";

export const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username }).populate("homeCity", "name slug");
  if (!user) throw ApiError.notFound("User not found");

  let isFollowing = false;
  if (req.user) {
    isFollowing = Boolean(await Follow.findOne({ follower: req.user._id, following: user._id }));
  }

  res.json({ success: true, data: { ...user.toPublicJSON(), homeCity: user.homeCity, isFollowing } });
});

export const updateMe = asyncHandler(async (req, res) => {
  const allowed = ["displayName", "bio", "interests", "homeCity", "preferences"];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, data: user.toPublicJSON() });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No image uploaded");
  const avatarUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { avatarUrl }, { new: true });
  res.json({ success: true, data: user.toPublicJSON() });
});

export const uploadCover = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No image uploaded");
  const coverUrl = `/uploads/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user._id, { coverUrl }, { new: true });
  res.json({ success: true, data: user.toPublicJSON() });
});

export const listSavedPlaces = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "savedPlaces",
    populate: [{ path: "neighborhood", select: "name slug" }, { path: "city", select: "name slug" }],
  });
  res.json({ success: true, data: user.savedPlaces });
});

export const toggleSavePlace = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) throw ApiError.notFound("Place not found");

  const user = await User.findById(req.user._id);
  const alreadySaved = user.savedPlaces.some((id) => id.equals(place._id));

  if (alreadySaved) {
    user.savedPlaces = user.savedPlaces.filter((id) => !id.equals(place._id));
    place.saveCount = Math.max(0, place.saveCount - 1);
    await logActivity({ user: user._id, type: "unsave", targetType: "Place", targetId: place._id });
  } else {
    user.savedPlaces.push(place._id);
    place.saveCount += 1;
    await logActivity({ user: user._id, type: "save", targetType: "Place", targetId: place._id });
  }

  await Promise.all([user.save(), place.save()]);
  const unlocked = await checkAndUnlockAchievements(user._id);

  res.json({ success: true, data: { saved: !alreadySaved, saveCount: place.saveCount, unlocked } });
});

export const followUser = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) throw ApiError.notFound("User not found");
  if (target._id.equals(req.user._id)) throw ApiError.badRequest("You cannot follow yourself");

  const existing = await Follow.findOne({ follower: req.user._id, following: target._id });
  if (existing) throw ApiError.conflict("Already following this user");

  await Follow.create({ follower: req.user._id, following: target._id });
  await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
  await User.findByIdAndUpdate(target._id, { $inc: { followersCount: 1 } });

  await createNotification({
    recipient: target._id,
    actor: req.user._id,
    type: "follow",
    message: `${req.user.displayName || req.user.username} started following you`,
  });
  await checkAndUnlockAchievements(req.user._id);

  res.json({ success: true, data: { following: true } });
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const target = await User.findOne({ username: req.params.username });
  if (!target) throw ApiError.notFound("User not found");

  const deleted = await Follow.findOneAndDelete({ follower: req.user._id, following: target._id });
  if (deleted) {
    await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(target._id, { $inc: { followersCount: -1 } });
  }

  res.json({ success: true, data: { following: false } });
});

export const listFollowers = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw ApiError.notFound("User not found");
  const follows = await Follow.find({ following: user._id }).populate(
    "follower",
    "username displayName avatarUrl bio",
  );
  res.json({ success: true, data: follows.map((f) => f.follower) });
});

export const listFollowing = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw ApiError.notFound("User not found");
  const follows = await Follow.find({ follower: user._id }).populate(
    "following",
    "username displayName avatarUrl bio",
  );
  res.json({ success: true, data: follows.map((f) => f.following) });
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw ApiError.notFound("User not found");
  const posts = await Post.find({ author: user._id, status: "published" })
    .sort({ createdAt: -1 })
    .populate("author", "username displayName avatarUrl")
    .populate("place", "name slug");
  res.json({ success: true, data: posts });
});

export const getUserCollections = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  if (!user) throw ApiError.notFound("User not found");
  const isOwner = req.user && req.user._id.equals(user._id);
  const filter = { owner: user._id, ...(isOwner ? {} : { isPublic: true }) };
  const collections = await Collection.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: collections });
});
