import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { generateItinerary } from "../services/ai.service.js";

export const askAssistant = asyncHandler(async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || prompt.trim().length < 5) {
    throw ApiError.badRequest("Tell me a bit more about what you're looking for");
  }

  const itinerary = await generateItinerary({ prompt, userId: req.user?._id });
  res.json({ success: true, data: itinerary });
});
