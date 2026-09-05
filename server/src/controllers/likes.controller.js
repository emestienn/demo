import { Like } from "../models/Like.js";
import { Post } from "../models/Post.js";
import { Comment } from "../models/Comment.js";
import { Review } from "../models/Review.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { logActivity } from "../services/activity.service.js";
import { createNotification } from "../services/notification.service.js";

const MODELS = { Post, Comment, Review };

export const toggleLike = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  const Model = MODELS[targetType];
  if (!Model) throw ApiError.badRequest("Invalid target type");

  const target = await Model.findById(targetId);
  if (!target) throw ApiError.notFound("Target not found");

  const existing = await Like.findOne({ user: req.user._id, targetType, targetId });

  if (existing) {
    await existing.deleteOne();
    target.likeCount = Math.max(0, (target.likeCount || 0) - 1);
    await target.save();
    return res.json({ success: true, data: { liked: false, likeCount: target.likeCount } });
  }

  await Like.create({ user: req.user._id, targetType, targetId });
  target.likeCount = (target.likeCount || 0) + 1;
  await target.save();

  if (targetType === "Post") {
    await logActivity({ user: req.user._id, type: "like", targetType: "Place", targetId: target.place });
    await createNotification({
      recipient: target.author,
      actor: req.user._id,
      type: "like",
      message: `${req.user.displayName || req.user.username} liked your post`,
      targetType: "Post",
      targetId: target._id,
    });
  }

  res.json({ success: true, data: { liked: true, likeCount: target.likeCount } });
});
