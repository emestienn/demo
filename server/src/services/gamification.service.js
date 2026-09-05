import { User } from "../models/User.js";
import { Achievement } from "../models/Achievement.js";
import { Post } from "../models/Post.js";
import { Review } from "../models/Review.js";
import { Collection } from "../models/Collection.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { Follow } from "../models/Follow.js";
import { createNotification } from "./notification.service.js";

export function xpForLevel(level) {
  return level * 100;
}

export async function addXp(userId, amount) {
  const user = await User.findById(userId);
  if (!user) return null;

  const previousLevel = user.level;
  user.xp += amount;
  while (user.xp >= xpForLevel(user.level)) {
    user.xp -= xpForLevel(user.level);
    user.level += 1;
  }
  await user.save();

  if (user.level > previousLevel) {
    await createNotification({
      recipient: user._id,
      type: "achievement",
      message: `Level up! You're now level ${user.level}.`,
    });
  }

  return user;
}

export async function touchStreak(userId) {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = new Date().toISOString().slice(0, 10);
  if (user.streak.lastActiveDate === today) return user;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  user.streak.count = user.streak.lastActiveDate === yesterday ? user.streak.count + 1 : 1;
  user.streak.lastActiveDate = today;
  await user.save();
  return user;
}

const ACHIEVEMENT_CHECKS = {
  "first-save": async (userId) => {
    const user = await User.findById(userId).select("savedPlaces");
    return user.savedPlaces.length >= 1;
  },
  "explorer-10-places": async (userId) => {
    const user = await User.findById(userId).select("savedPlaces");
    return user.savedPlaces.length >= 10;
  },
  "first-post": async (userId) => (await Post.countDocuments({ author: userId })) >= 1,
  "reviewer-5-reviews": async (userId) => (await Review.countDocuments({ author: userId })) >= 5,
  "collector-3-collections": async (userId) => (await Collection.countDocuments({ owner: userId })) >= 3,
  "polyglot-5-lessons": async (userId) =>
    (await LessonProgress.countDocuments({ user: userId, status: "completed" })) >= 5,
  "social-butterfly-10-follows": async (userId) => (await Follow.countDocuments({ follower: userId })) >= 10,
  "streak-7": async (userId) => {
    const user = await User.findById(userId).select("streak");
    return user.streak.count >= 7;
  },
};

export async function checkAndUnlockAchievements(userId) {
  const user = await User.findById(userId);
  if (!user) return [];

  const unlockedKeys = new Set(user.unlockedAchievements.map((a) => a.key));
  const newlyUnlocked = [];

  for (const [key, check] of Object.entries(ACHIEVEMENT_CHECKS)) {
    if (unlockedKeys.has(key)) continue;
    const passed = await check(userId).catch(() => false);
    if (!passed) continue;

    const achievement = await Achievement.findOne({ key });
    if (!achievement) continue;

    user.unlockedAchievements.push({ key, unlockedAt: new Date() });
    newlyUnlocked.push(achievement);
  }

  if (newlyUnlocked.length) {
    await user.save();
    for (const achievement of newlyUnlocked) {
      await addXp(userId, achievement.xpReward);
      await createNotification({
        recipient: userId,
        type: "achievement",
        message: `Achievement unlocked: ${achievement.title}`,
        targetType: "Achievement",
      });
    }
  }

  return newlyUnlocked;
}
