import { Achievement } from "../models/Achievement.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listAchievements = asyncHandler(async (req, res) => {
  const catalog = await Achievement.find().sort({ xpReward: 1 });
  const unlockedKeys = new Set((req.user?.unlockedAchievements || []).map((a) => a.key));
  const unlockedMap = new Map((req.user?.unlockedAchievements || []).map((a) => [a.key, a.unlockedAt]));

  const data = catalog.map((achievement) => ({
    ...achievement.toObject(),
    unlocked: unlockedKeys.has(achievement.key),
    unlockedAt: unlockedMap.get(achievement.key) || null,
  }));

  res.json({ success: true, data });
});
