import { Place } from "../models/Place.js";
import { Review } from "../models/Review.js";
import { Food } from "../models/Food.js";
import { Event } from "../models/Event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { logActivity } from "../services/activity.service.js";

export const listPlaces = asyncHandler(async (req, res) => {
  const { city, neighborhood, category, tag, price, search, lat, lng, radius, featured } = req.query;
  const filter = { status: "published" };

  if (city) filter.city = city;
  if (neighborhood) filter.neighborhood = neighborhood;
  if (category) filter.category = { $in: category.split(",") };
  if (tag) filter.tags = tag;
  if (price) filter.priceLevel = { $in: price.split(",").map(Number) };
  if (featured) filter.featured = featured === "true";
  if (search) filter.$text = { $search: search };

  if (lat && lng) {
    filter.location = {
      $near: {
        $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
        $maxDistance: Number(radius) || 8000,
      },
    };
  }

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Place.find(filter)
      .populate("neighborhood", "name slug")
      .populate("city", "name slug")
      .sort(lat && lng ? undefined : { featured: -1, rating: -1 })
      .skip(skip)
      .limit(limit),
    Place.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ page, limit, total }) });
});

export const getPlace = asyncHandler(async (req, res) => {
  const place = await Place.findOne({ slug: req.params.slug })
    .populate("neighborhood")
    .populate("city", "name slug")
    .populate("relatedCulture", "title slug type");
  if (!place) throw ApiError.notFound("Place not found");

  place.viewCount += 1;
  await place.save();

  if (req.user) {
    await logActivity({ user: req.user._id, type: "view", targetType: "Place", targetId: place._id });
  }

  const [reviews, nearby, food, events] = await Promise.all([
    Review.find({ place: place._id }).sort({ createdAt: -1 }).populate("author", "username displayName avatarUrl"),
    Place.find({
      _id: { $ne: place._id },
      neighborhood: place.neighborhood._id,
      status: "published",
    })
      .limit(4)
      .select("name slug images category rating priceLevel"),
    Food.find({ recommendedPlaces: place._id }).limit(4),
    Event.find({ place: place._id, startDate: { $gte: new Date() } }).limit(4),
  ]);

  res.json({ success: true, data: { place, reviews, nearby, food, events } });
});

export const createPlace = asyncHandler(async (req, res) => {
  const slug = req.body.slug || slugify(req.body.name);
  const place = await Place.create({ ...req.body, slug, createdBy: req.user._id });
  res.status(201).json({ success: true, data: place });
});

export const updatePlace = asyncHandler(async (req, res) => {
  const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!place) throw ApiError.notFound("Place not found");
  res.json({ success: true, data: place });
});

export const deletePlace = asyncHandler(async (req, res) => {
  const place = await Place.findByIdAndDelete(req.params.id);
  if (!place) throw ApiError.notFound("Place not found");
  res.json({ success: true, data: null });
});
