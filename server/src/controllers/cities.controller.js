import { City } from "../models/City.js";
import { Neighborhood } from "../models/Neighborhood.js";
import { Place } from "../models/Place.js";
import { Event } from "../models/Event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";

export const listCities = asyncHandler(async (_req, res) => {
  const cities = await City.find().sort({ name: 1 });
  res.json({ success: true, data: cities });
});

export const getCity = asyncHandler(async (req, res) => {
  const city = await City.findOne({ slug: req.params.slug });
  if (!city) throw ApiError.notFound("City not found");

  const [neighborhoods, topPlaces, upcomingEvents] = await Promise.all([
    Neighborhood.find({ city: city._id }).sort({ rating: -1 }),
    Place.find({ city: city._id, status: "published" }).sort({ rating: -1 }).limit(8).populate("neighborhood", "name slug"),
    Event.find({ city: city._id, startDate: { $gte: new Date() } }).sort({ startDate: 1 }).limit(6),
  ]);

  res.json({ success: true, data: { city, neighborhoods, topPlaces, upcomingEvents } });
});

export const createCity = asyncHandler(async (req, res) => {
  const slug = req.body.slug || slugify(req.body.name);
  const city = await City.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: city });
});

export const updateCity = asyncHandler(async (req, res) => {
  const city = await City.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!city) throw ApiError.notFound("City not found");
  res.json({ success: true, data: city });
});

export const deleteCity = asyncHandler(async (req, res) => {
  const city = await City.findByIdAndDelete(req.params.id);
  if (!city) throw ApiError.notFound("City not found");
  res.json({ success: true, data: null });
});
