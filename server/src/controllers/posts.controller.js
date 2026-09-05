import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { Follow } from "../models/Follow.js";
import { Like } from "../models/Like.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { addXp, checkAndUnlockAchievements } from "../services/gamification.service.js";
import { createNotification } from "../services/notification.service.js";

const POPULATE = [
  { path: "author", select: "username displayName avatarUrl" },
  { path: "place", select: "name slug images" },
  { path: "neighborhood", select: "name slug" },
  { path: "food", select: "nameEnglish nameKorean slug" },
  { path: "event", select: "title slug" },
];

export const listFeed = asyncHandler(async (req, res) => {
  const { author, following, place, neighborhood } = req.query;
  const filter = { status: "published" };
  if (author) filter.author = author;
  if (place) filter.place = place;
  if (neighborhood) filter.neighborhood = neighborhood;

  if (following === "true" && req.user) {
    const follows = await Follow.find({ follower: req.user._id }).select("following");
    filter.author = { $in: follows.map((f) => f.following) };
  }

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Post.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate(POPULATE),
    Post.countDocuments(filter),
  ]);

  let likedIds = new Set();
  if (req.user) {
    const likes = await Like.find({ user: req.user._id, targetType: "Post", targetId: { $in: items.map((p) => p._id) } });
    likedIds = new Set(likes.map((l) => String(l.targetId)));
  }

  const data = items.map((post) => ({ ...post.toObject(), likedByMe: likedIds.has(String(post._id)) }));

  res.json({ success: true, data, meta: buildMeta({ page, limit, total }) });
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate(POPULATE);
  if (!post) throw ApiError.notFound("Post not found");
  res.json({ success: true, data: post });
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create({ ...req.body, author: req.user._id });
  await addXp(req.user._id, 5);
  const unlocked = await checkAndUnlockAchievements(req.user._id);
  const populated = await post.populate(POPULATE);
  res.status(201).json({ success: true, data: populated, unlocked });
});

export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");
  if (!post.author.equals(req.user._id) && req.user.role === "user") throw ApiError.forbidden();

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();
  res.json({ success: true, data: null });
});

export const listComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ post: req.params.id })
    .sort({ createdAt: 1 })
    .populate("author", "username displayName avatarUrl");
  res.json({ success: true, data: comments });
});

export const createComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw ApiError.notFound("Post not found");

  const comment = await Comment.create({ post: post._id, author: req.user._id, text: req.body.text });
  post.commentCount += 1;
  await post.save();

  await createNotification({
    recipient: post.author,
    actor: req.user._id,
    type: "comment",
    message: `${req.user.displayName || req.user.username} commented on your post`,
    targetType: "Post",
    targetId: post._id,
  });

  const populated = await comment.populate("author", "username displayName avatarUrl");
  res.status(201).json({ success: true, data: populated });
});

export const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw ApiError.notFound("Comment not found");
  if (!comment.author.equals(req.user._id) && req.user.role === "user") throw ApiError.forbidden();

  await comment.deleteOne();
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });
  res.json({ success: true, data: null });
});
