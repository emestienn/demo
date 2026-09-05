import { Place } from "../models/Place.js";
import { UserActivity } from "../models/UserActivity.js";
import { User } from "../models/User.js";

const ACTIVITY_WEIGHT = { view: 1, search: 0.5, like: 3, save: 5, unsave: -3, rate: 4, visit: 2 };

async function buildCategoryAffinity(userId) {
  const affinity = {};

  const user = await User.findById(userId).select("interests preferences savedPlaces");
  if (!user) return affinity;

  for (const category of user.interests || []) {
    affinity[category] = (affinity[category] || 0) + 4;
  }
  for (const category of user.preferences?.categories || []) {
    affinity[category] = (affinity[category] || 0) + 4;
  }

  if (user.savedPlaces?.length) {
    const savedPlaceCategories = await Place.find({ _id: { $in: user.savedPlaces } }).select("category");
    for (const p of savedPlaceCategories) {
      affinity[p.category] = (affinity[p.category] || 0) + 3;
    }
  }

  const activities = await UserActivity.find({
    user: userId,
    targetType: "Place",
    createdAt: { $gte: new Date(Date.now() - 30 * 86400000) },
  })
    .sort({ createdAt: -1 })
    .limit(200)
    .select("type targetId");

  if (activities.length) {
    const placeIds = [...new Set(activities.map((a) => String(a.targetId)))];
    const places = await Place.find({ _id: { $in: placeIds } }).select("category");
    const categoryById = new Map(places.map((p) => [String(p._id), p.category]));

    for (const activity of activities) {
      const category = categoryById.get(String(activity.targetId));
      if (!category) continue;
      const weight = ACTIVITY_WEIGHT[activity.type] || 0;
      affinity[category] = (affinity[category] || 0) + weight;
    }
  }

  return affinity;
}

function popularityScore(place) {
  return place.rating * Math.log2((place.reviewCount || 0) + 2);
}

export async function getForYou(userId, limit = 8) {
  const query = { status: "published" };
  let excludeIds = [];
  let affinity = {};
  let priceLevels = [1, 2, 3, 4];

  if (userId) {
    const user = await User.findById(userId).select("savedPlaces preferences");
    excludeIds = user?.savedPlaces || [];
    priceLevels = user?.preferences?.priceLevel?.length ? user.preferences.priceLevel : priceLevels;
    affinity = await buildCategoryAffinity(userId);
  }

  if (excludeIds.length) query._id = { $nin: excludeIds };

  const candidates = await Place.find(query)
    .populate("neighborhood", "name slug")
    .populate("city", "name slug")
    .limit(120);

  const scored = candidates.map((place) => {
    const categoryMatch = (affinity[place.category] || 0) * 3;
    const priceMatch = priceLevels.includes(place.priceLevel) ? 4 : 0;
    const popularity = popularityScore(place) * 2;
    const featuredBoost = place.featured ? 3 : 0;
    const score = categoryMatch + priceMatch + popularity + featuredBoost;
    return { place, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const hasSignal = Object.keys(affinity).length > 0;
  return scored.slice(0, limit).map(({ place, score }) => ({
    place,
    matchScore: hasSignal ? Math.min(99, Math.round(55 + score)) : null,
  }));
}

export async function getTrending(limit = 8) {
  const since = new Date(Date.now() - 14 * 86400000);
  const agg = await UserActivity.aggregate([
    { $match: { targetType: "Place", createdAt: { $gte: since } } },
    { $group: { _id: "$targetId", score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: limit * 2 },
  ]);

  const ids = agg.map((a) => a._id);
  if (!ids.length) {
    return Place.find({ status: "published" }).sort({ rating: -1, reviewCount: -1 }).limit(limit).populate(
      "neighborhood city",
      "name slug",
    );
  }

  const places = await Place.find({ _id: { $in: ids }, status: "published" }).populate(
    "neighborhood city",
    "name slug",
  );
  const orderMap = new Map(agg.map((a, i) => [String(a._id), i]));
  places.sort((a, b) => (orderMap.get(String(a._id)) ?? 999) - (orderMap.get(String(b._id)) ?? 999));
  return places.slice(0, limit);
}

export async function getHiddenGems(limit = 8) {
  return Place.find({ status: "published", rating: { $gte: 4.3 }, reviewCount: { $lte: 12 } })
    .sort({ rating: -1 })
    .limit(limit)
    .populate("neighborhood city", "name slug");
}

export async function getNearby(lat, lng, limit = 8) {
  if (lat == null || lng == null) return [];
  return Place.find({
    status: "published",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: 5000,
      },
    },
  })
    .limit(limit)
    .populate("neighborhood city", "name slug");
}
