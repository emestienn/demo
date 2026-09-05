import mongoose from "mongoose";

const { Schema } = mongoose;

export const CULTURE_TYPES = [
  "kpop",
  "kdrama",
  "cinema",
  "fashion",
  "beauty",
  "street-culture",
  "traditional",
  "festival",
  "trend",
];

const cultureSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: CULTURE_TYPES, required: true, index: true },
    summary: { type: String, default: "" },
    body: { type: String, default: "" },
    images: [{ type: String }],
    relatedPlaces: [{ type: Schema.Types.ObjectId, ref: "Place" }],
    relatedNeighborhood: { type: Schema.Types.ObjectId, ref: "Neighborhood" },
    relatedCity: { type: Schema.Types.ObjectId, ref: "City" },
    tags: [{ type: String }],
    popularityScore: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

cultureSchema.index({ title: "text", summary: "text", body: "text" });

export const Culture = mongoose.model("Culture", cultureSchema);
