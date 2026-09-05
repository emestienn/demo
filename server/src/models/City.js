import mongoose from "mongoose";

const { Schema } = mongoose;

const citySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    tagline: { type: String, default: "" },
    description: { type: String, default: "" },
    heroImage: { type: String, default: "" },
    gallery: [{ type: String }],
    region: { type: String, default: "" },
    population: { type: Number, default: 0 },
    center: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    zoom: { type: Number, default: 12 },
    highlights: [{ type: String }],
    transportation: [{ type: String }],
    bestSeason: { type: String, default: "" },
    stats: {
      neighborhoodCount: { type: Number, default: 0 },
      placeCount: { type: Number, default: 0 },
      eventCount: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

export const City = mongoose.model("City", citySchema);
