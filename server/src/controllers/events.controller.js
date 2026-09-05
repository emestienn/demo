import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";
import { getPagination, buildMeta } from "../utils/pagination.js";
import { logActivity } from "../services/activity.service.js";

export const listEvents = asyncHandler(async (req, res) => {
  const { city, type, upcoming, search } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (type) filter.type = { $in: type.split(",") };
  if (upcoming === "true") filter.startDate = { $gte: new Date() };
  if (search) filter.$text = { $search: search };

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    Event.find(filter)
      .populate("city", "name slug")
      .populate("neighborhood", "name slug")
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit),
    Event.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ page, limit, total }) });
});

export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findOne({ slug: req.params.slug })
    .populate("city", "name slug")
    .populate("neighborhood", "name slug")
    .populate("place", "name slug images");
  if (!event) throw ApiError.notFound("Event not found");

  if (req.user) {
    await logActivity({ user: req.user._id, type: "view", targetType: "Event", targetId: event._id });
  }

  res.json({ success: true, data: event });
});

export const toggleSaveEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw ApiError.notFound("Event not found");

  const user = await User.findById(req.user._id);
  const isSaved = user.savedEvents.some((id) => id.equals(event._id));

  if (isSaved) {
    user.savedEvents = user.savedEvents.filter((id) => !id.equals(event._id));
    event.saveCount = Math.max(0, event.saveCount - 1);
  } else {
    user.savedEvents.push(event._id);
    event.saveCount += 1;
  }

  await logActivity({ user: user._id, type: isSaved ? "unsave" : "save", targetType: "Event", targetId: event._id });
  await Promise.all([user.save(), event.save()]);

  res.json({ success: true, data: { saved: !isSaved, saveCount: event.saveCount } });
});

export const listSavedEvents = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "savedEvents",
    populate: [{ path: "city", select: "name slug" }, { path: "neighborhood", select: "name slug" }],
  });
  res.json({ success: true, data: user.savedEvents });
});

export const createEvent = asyncHandler(async (req, res) => {
  const slug = req.body.slug || slugify(req.body.title);
  const event = await Event.create({ ...req.body, slug });
  res.status(201).json({ success: true, data: event });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) throw ApiError.notFound("Event not found");
  res.json({ success: true, data: event });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) throw ApiError.notFound("Event not found");
  res.json({ success: true, data: null });
});
