import { Food } from "../models/Food.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { logActivity } from "../services/activity.service.js";

export const listFood = asyncHandler(async (req, res) => {
  const { category, spiceMax, search, region } = req.query;
  const filter = {};
  if (category) filter.category = { $in: category.split(",") };
  if (region) filter.region = region;
  if (spiceMax) filter.spiceLevel = { $lte: Number(spiceMax) };
  if (search) filter.$text = { $search: search };

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Food.find(filter).sort({ popularityScore: -1 }).skip(skip).limit(limit),
    Food.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ page, limit, total }) });
});

export const getFood = asyncHandler(async (req, res) => {
  const food = await Food.findOne({ slug: req.params.slug }).populate(
    "recommendedPlaces",
    "name slug images neighborhood city rating priceLevel",
  );
  if (!food) throw ApiError.notFound("Food item not found");

  if (req.user) {
    await logActivity({ user: req.user._id, type: "view", targetType: "Food", targetId: food._id });
  }

  res.json({ success: true, data: food });
});

export const createFood = asyncHandler(async (req, res) => {
  const slug = req.body.slug || slugify(req.body.nameEnglish);
  const food = await Food.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: food });
});

export const updateFood = asyncHandler(async (req, res) => {
  const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!food) throw ApiError.notFound("Food item not found");
  res.json({ success: true, data: food });
});

export const deleteFood = asyncHandler(async (req, res) => {
  const food = await Food.findByIdAndDelete(req.params.id);
  if (!food) throw ApiError.notFound("Food item not found");
  res.json({ success: true, data: null });
});
