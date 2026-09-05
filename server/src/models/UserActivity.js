import mongoose from "mongoose";

const { Schema } = mongoose;

export const ACTIVITY_TYPES = [
  "view",
  "search",
  "like",
  "save",
  "unsave",
  "rate",
  "complete_lesson",
  "visit",
];

const userActivitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    targetType: { type: String, enum: ["Place", "Neighborhood", "Food", "Event", "Culture", "Query"] },
    targetId: { type: Schema.Types.ObjectId, refPath: "targetType" },
    meta: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

userActivitySchema.index({ user: 1, createdAt: -1 });

export const UserActivity = mongoose.model("UserActivity", userActivitySchema);
