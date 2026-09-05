import { Culture } from "../models/Culture.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { logActivity } from "../services/activity.service.js";

export const listCulture = asyncHandler(async (req, res) => {
  const { type, search, featured } = req.query;
  const filter = {};
  if (type) filter.type = { $in: type.split(",") };
  if (featured) filter.featured = featured === "true";
  if (search) filter.$text = { $search: search };

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Culture.find(filter)
      .populate("relatedNeighborhood", "name slug")
      .populate("relatedCity", "name slug")
      .sort({ popularityScore: -1 })
      .skip(skip)
      .limit(limit),
    Culture.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ page, limit, total }) });
});

export const getCulture = asyncHandler(async (req, res) => {
  const item = await Culture.findOne({ slug: req.params.slug })
    .populate("relatedPlaces", "name slug images category neighborhood")
    .populate("relatedNeighborhood", "name slug")
    .populate("relatedCity", "name slug");
  if (!item) throw ApiError.notFound("Culture item not found");

  if (req.user) {
    await logActivity({ user: req.user._id, type: "view", targetType: "Culture", targetId: item._id });
  }

  res.json({ success: true, data: item });
});

export const createCulture = asyncHandler(async (req, res) => {
  const slug = req.body.slug || slugify(req.body.title);
  const item = await Culture.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: item });
});

export const updateCulture = asyncHandler(async (req, res) => {
  const item = await Culture.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) throw ApiError.notFound("Culture item not found");
  res.json({ success: true, data: item });
});

export const deleteCulture = asyncHandler(async (req, res) => {
  const item = await Culture.findByIdAndDelete(req.params.id);
  if (!item) throw ApiError.notFound("Culture item not found");
  res.json({ success: true, data: null });
});
