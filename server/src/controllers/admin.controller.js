import { User } from "../models/User.js";
import { Place } from "../models/Place.js";
import { Post } from "../models/Post.js";
import { Event } from "../models/Event.js";
import { Review } from "../models/Review.js";
import { UserActivity } from "../models/UserActivity.js";
import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { getPagination, buildMeta } from "../utils/pagination.js";

export const getDashboardStats = asyncHandler(async (_req, res) => {
  const since30 = new Date(Date.now() - 30 * 86400000);
  const since7 = new Date(Date.now() - 7 * 86400000);

  const [
    userCount,
    newUsers30,
    placeCount,
    postCount,
    eventCount,
    reviewCount,
    openReports,
    activityByDay,
    topCategories,
    topPlaces,
    usersByRole,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: since30 } }),
    Place.countDocuments(),
    Post.countDocuments(),
    Event.countDocuments(),
    Review.countDocuments(),
    Report.countDocuments({ status: "open" }),
    UserActivity.aggregate([
      { $match: { createdAt: { $gte: since30 } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Place.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
    Place.find().sort({ viewCount: -1 }).limit(5).select("name slug viewCount saveCount rating"),
    User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
  ]);

  const engagementLast7 = await UserActivity.countDocuments({ createdAt: { $gte: since7 } });

  res.json({
    success: true,
    data: {
      totals: { userCount, newUsers30, placeCount, postCount, eventCount, reviewCount, openReports, engagementLast7 },
      activityByDay,
      topCategories,
      topPlaces,
      usersByRole,
    },
  });
});

export const listUsers = asyncHandler(async (req, res) => {
  const { search, role } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [{ username: new RegExp(search, "i") }, { email: new RegExp(search, "i") }];

  const { page, limit, skip } = getPagination(req.query);
  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, meta: buildMeta({ page, limit, total }) });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!["user", "moderator", "admin"].includes(role)) throw ApiError.badRequest("Invalid role");

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
});

export const setUserSuspended = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isSuspended: Boolean(req.body.isSuspended) },
    { new: true },
  );
  if (!user) throw ApiError.notFound("User not found");
  res.json({ success: true, data: user });
});

export const listReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const reports = await Report.find(filter)
    .sort({ createdAt: -1 })
    .populate("reporter", "username displayName")
    .populate("resolvedBy", "username displayName");
  res.json({ success: true, data: reports });
});

export const updateReportStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const report = await Report.findByIdAndUpdate(
    req.params.id,
    { status, resolvedBy: req.user._id },
    { new: true },
  );
  if (!report) throw ApiError.notFound("Report not found");
  res.json({ success: true, data: report });
});
