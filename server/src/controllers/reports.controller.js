import { Report } from "../models/Report.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReport = asyncHandler(async (req, res) => {
  const { targetType, targetId, reason } = req.body;
  const report = await Report.create({ reporter: req.user._id, targetType, targetId, reason });
  res.status(201).json({ success: true, data: report });
});
