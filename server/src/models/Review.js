import mongoose from "mongoose";

const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    place: { type: Schema.Types.ObjectId, ref: "Place", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, maxlength: 1000, default: "" },
    images: [{ type: String }],
  },
  { timestamps: true },
);

reviewSchema.index({ place: 1, author: 1 }, { unique: true });

export const Review = mongoose.model("Review", reviewSchema);
