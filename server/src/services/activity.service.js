import { UserActivity } from "../models/UserActivity.js";
import { touchStreak } from "./gamification.service.js";

export async function logActivity({ user, type, targetType, targetId, meta }) {
  if (!user) return null;
  const activity = await UserActivity.create({ user, type, targetType, targetId, meta });
  touchStreak(user).catch(() => {});
  return activity;
}
