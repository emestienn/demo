import mongoose from "mongoose";

const { Schema } = mongoose;

const likeSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["Post", "Comment", "Review"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true },
);

likeSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
