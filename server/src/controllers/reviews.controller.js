import { Review } from "../models/Review.js";
import { Place } from "../models/Place.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { logActivity } from "../services/activity.service.js";
import { checkAndUnlockAchievements } from "../services/gamification.service.js";
import { addXp } from "../services/gamification.service.js";

async function recalcPlaceRating(placeId) {
  const stats = await Review.aggregate([
    { $match: { place: placeId } },
    { $group: { _id: "$place", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Place.findByIdAndUpdate(placeId, { rating: Number(avg.toFixed(2)), reviewCount: count });
}

export const createReview = asyncHandler(async (req, res) => {
  const place = await Place.findById(req.params.placeId);
  if (!place) throw ApiError.notFound("Place not found");

  const existing = await Review.findOne({ place: place._id, author: req.user._id });
  if (existing) throw ApiError.conflict("You already reviewed this place");

  const review = await Review.create({
    place: place._id,
    author: req.user._id,
    rating: req.body.rating,
    text: req.body.text || "",
    images: req.body.images || [],
  });

  await recalcPlaceRating(place._id);
  await logActivity({ user: req.user._id, type: "rate", targetType: "Place", targetId: place._id, meta: { rating: req.body.rating } });
  await addXp(req.user._id, 10);
  const unlocked = await checkAndUnlockAchievements(req.user._id);

  const populated = await review.populate("author", "username displayName avatarUrl");
  res.status(201).json({ success: true, data: populated, unlocked });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound("Review not found");
  if (!review.author.equals(req.user._id) && req.user.role === "user") {
    throw ApiError.forbidden();
  }
  await review.deleteOne();
  await recalcPlaceRating(review.place);
  res.json({ success: true, data: null });
});
