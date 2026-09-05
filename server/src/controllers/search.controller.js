import { Place } from "../models/Place.js";
import { Neighborhood } from "../models/Neighborhood.js";
import { City } from "../models/City.js";
import { Food } from "../models/Food.js";
import { Event } from "../models/Event.js";
import { Culture } from "../models/Culture.js";
import { Post } from "../models/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logActivity } from "../services/activity.service.js";

export const globalSearch = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json({ success: true, data: { places: [], neighborhoods: [], cities: [], food: [], events: [], culture: [], posts: [] } });
  }

  const textFilter = { $text: { $search: q } };
  const score = { score: { $meta: "textScore" } };
  const wantsAll = !type || type === "all";

  const [places, neighborhoods, cities, food, events, culture, posts] = await Promise.all([
    wantsAll || type === "places"
      ? Place.find({ ...textFilter, status: "published" }, score).sort(score).limit(8).populate("neighborhood city", "name slug")
      : [],
    wantsAll || type === "neighborhoods"
      ? Neighborhood.find(textFilter, score).sort(score).limit(6).populate("city", "name slug")
      : [],
    wantsAll || type === "cities" ? City.find({ name: new RegExp(q, "i") }).limit(4) : [],
    wantsAll || type === "food" ? Food.find(textFilter, score).sort(score).limit(6) : [],
    wantsAll || type === "events" ? Event.find(textFilter, score).sort(score).limit(6) : [],
    wantsAll || type === "culture" ? Culture.find(textFilter, score).sort(score).limit(6) : [],
    wantsAll || type === "posts" ? Post.find(textFilter, score).sort(score).limit(6).populate("author", "username avatarUrl") : [],
  ]);

  if (req.user) {
    await logActivity({ user: req.user._id, type: "search", targetType: "Query", meta: { q } });
  }

  res.json({ success: true, data: { places, neighborhoods, cities, food, events, culture, posts } });
});
