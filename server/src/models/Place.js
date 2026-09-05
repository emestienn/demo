import mongoose from "mongoose";

const { Schema } = mongoose;

export const PLACE_CATEGORIES = [
  "cafe",
  "restaurant",
  "bar",
  "nightlife",
  "shopping",
  "culture",
  "landmark",
  "nature",
  "kpop",
  "art",
  "market",
  "wellness",
];

const placeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    city: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    neighborhood: { type: Schema.Types.ObjectId, ref: "Neighborhood", required: true, index: true },
    category: { type: String, enum: PLACE_CATEGORIES, required: true, index: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    address: { type: String, default: "" },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    priceLevel: { type: Number, min: 1, max: 4, default: 2 },
    tags: [{ type: String, index: true }],
    openingHours: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    isDramaLocation: { type: Boolean, default: false },
    relatedCulture: [{ type: Schema.Types.ObjectId, ref: "Culture" }],
    featured: { type: Boolean, default: false },
    status: { type: String, enum: ["published", "pending", "flagged"], default: "published" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

placeSchema.index({ location: "2dsphere" });
placeSchema.index({ name: "text", description: "text", tags: "text" });

export const Place = mongoose.model("Place", placeSchema);
