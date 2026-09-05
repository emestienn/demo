import mongoose from "mongoose";

const { Schema } = mongoose;

const achievementSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, default: "sparkles" },
    xpReward: { type: Number, default: 50 },
    criteria: { type: String, default: "" },
  },
  { timestamps: true },
);

export const Achievement = mongoose.model("Achievement", achievementSchema);
