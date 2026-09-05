import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadRouter = Router();

uploadRouter.post(
  "/image",
  requireAuth,
  upload.single("image"),
  asyncHandler(async (req, res) => {
    if (!req.file) throw ApiError.badRequest("No image uploaded");
    res.status(201).json({ success: true, data: { url: `/uploads/${req.file.filename}` } });
  }),
);

uploadRouter.post(
  "/images",
  requireAuth,
  upload.array("images", 6),
  asyncHandler(async (req, res) => {
    if (!req.files?.length) throw ApiError.badRequest("No images uploaded");
    res.status(201).json({ success: true, data: { urls: req.files.map((f) => `/uploads/${f.filename}`) } });
  }),
);
