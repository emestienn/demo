import mongoose from "mongoose";

const { Schema } = mongoose;

const neighborhoodSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    city: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    gallery: [{ type: String }],
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    vibeTags: [{ type: String }],
    atmosphere: { type: String, default: "" },
    avgPriceLevel: { type: Number, min: 1, max: 4, default: 2 },
    bestTimeToVisit: { type: String, default: "" },
    popularActivities: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

neighborhoodSchema.index({ name: "text", tagline: "text", description: "text" });

export const Neighborhood = mongoose.model("Neighborhood", neighborhoodSchema);
