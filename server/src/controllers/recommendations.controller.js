import { asyncHandler } from "../utils/asyncHandler.js";
import * as recommendationService from "../services/recommendation.service.js";
import { Event } from "../models/Event.js";
import { Post } from "../models/Post.js";
import { UserActivity } from "../models/UserActivity.js";
import { LanguageLesson } from "../models/LanguageLesson.js";
import { Culture } from "../models/Culture.js";

export const getDiscoverFeed = asyncHandler(async (req, res) => {
  const { lat, lng } = req.query;
  const userId = req.user?._id;

  const [forYou, trending, hiddenGems, nearby, upcomingEvents, communityPicks, recentlyViewed, cultureSpotlight, dailyChallenge] =
    await Promise.all([
      recommendationService.getForYou(userId, 6),
      recommendationService.getTrending(8),
      recommendationService.getHiddenGems(6),
      recommendationService.getNearby(lat, lng, 6),
      Event.find({ startDate: { $gte: new Date() } }).sort({ startDate: 1 }).limit(6).populate("city", "name slug"),
      Post.find({ status: "published" }).sort({ likeCount: -1, createdAt: -1 }).limit(6).populate("author", "username displayName avatarUrl").populate("place", "name slug"),
      userId
        ? UserActivity.find({ user: userId, type: "view", targetType: "Place" })
            .sort({ createdAt: -1 })
            .limit(6)
            .populate({ path: "targetId", model: "Place", select: "name slug images category rating neighborhood", populate: { path: "neighborhood", select: "name slug" } })
        : [],
      Culture.find({ featured: true }).sort({ popularityScore: -1 }).limit(4),
      LanguageLesson.findOne().sort({ createdAt: -1 }),
    ]);

  res.json({
    success: true,
    data: {
      forYou,
      trending,
      hiddenGems,
      nearby,
      upcomingEvents,
      communityPicks,
      recentlyViewed: recentlyViewed.filter((a) => a.targetId).map((a) => a.targetId),
      cultureSpotlight,
      dailyChallenge,
    },
  });
});
