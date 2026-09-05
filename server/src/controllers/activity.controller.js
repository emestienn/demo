import { UserActivity } from "../models/UserActivity.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMyActivity = asyncHandler(async (req, res) => {
  const [recentSearches, recentViews] = await Promise.all([
    UserActivity.find({ user: req.user._id, type: "search" }).sort({ createdAt: -1 }).limit(10),
    UserActivity.find({ user: req.user._id, type: "view" })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate("targetId"),
  ]);

  res.json({
    success: true,
    data: {
      recentSearches: recentSearches.map((a) => a.meta?.q).filter(Boolean),
      recentViews: recentViews.filter((a) => a.targetId).map((a) => ({ type: a.targetType, item: a.targetId, viewedAt: a.createdAt })),
    },
  });
});
