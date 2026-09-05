import { Neighborhood } from "../models/Neighborhood.js";
import { Place } from "../models/Place.js";
import { Event } from "../models/Event.js";
import { Post } from "../models/Post.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

export const listNeighborhoods = asyncHandler(async (req, res) => {
  const { city, vibe, featured } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (vibe) filter.vibeTags = vibe;
  if (featured) filter.featured = featured === "true";

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Neighborhood.find(filter).populate("city", "name slug").sort({ rating: -1 }).skip(skip).limit(limit),
    Neighborhood.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ page, limit, total }) });
});

export const getNeighborhood = asyncHandler(async (req, res) => {
  const neighborhood = await Neighborhood.findOne({ slug: req.params.slug }).populate("city", "name slug");
  if (!neighborhood) throw ApiError.notFound("Neighborhood not found");

  const [places, events, posts] = await Promise.all([
    Place.find({ neighborhood: neighborhood._id, status: "published" }).sort({ rating: -1 }),
    Event.find({ neighborhood: neighborhood._id, startDate: { $gte: new Date() } }).sort({ startDate: 1 }).limit(6),
    Post.find({ neighborhood: neighborhood._id, status: "published" })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("author", "username displayName avatarUrl"),
  ]);

  res.json({ success: true, data: { neighborhood, places, events, posts } });
});

export const createNeighborhood = asyncHandler(async (req, res) => {
  const slug = req.body.slug || slugify(req.body.name);
  const neighborhood = await Neighborhood.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: neighborhood });
});

export const updateNeighborhood = asyncHandler(async (req, res) => {
  const neighborhood = await Neighborhood.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!neighborhood) throw ApiError.notFound("Neighborhood not found");
  res.json({ success: true, data: neighborhood });
});

export const deleteNeighborhood = asyncHandler(async (req, res) => {
  const neighborhood = await Neighborhood.findByIdAndDelete(req.params.id);
  if (!neighborhood) throw ApiError.notFound("Neighborhood not found");
  res.json({ success: true, data: null });
});
