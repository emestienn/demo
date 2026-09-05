import mongoose from "mongoose";

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    text: { type: String, required: true, maxlength: 2000 },
    images: [{ type: String }],
    place: { type: Schema.Types.ObjectId, ref: "Place" },
    neighborhood: { type: Schema.Types.ObjectId, ref: "Neighborhood" },
    food: { type: Schema.Types.ObjectId, ref: "Food" },
    event: { type: Schema.Types.ObjectId, ref: "Event" },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    status: { type: String, enum: ["published", "flagged", "removed"], default: "published" },
  },
  { timestamps: true },
);

postSchema.index({ text: "text" });
postSchema.index({ createdAt: -1 });

export const Post = mongoose.model("Post", postSchema);
