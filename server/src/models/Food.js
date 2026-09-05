import mongoose from "mongoose";

const { Schema } = mongoose;

export const FOOD_CATEGORIES = [
  "bbq",
  "street-food",
  "noodles",
  "soups-stews",
  "desserts",
  "cafe-drinks",
  "traditional",
  "regional",
  "convenience-store",
];

const foodSchema = new Schema(
  {
    nameKorean: { type: String, required: true },
    nameEnglish: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    category: { type: String, enum: FOOD_CATEGORIES, required: true, index: true },
    description: { type: String, default: "" },
    ingredients: [{ type: String }],
    origin: { type: String, default: "" },
    region: { type: String, default: "" },
    priceRange: { type: String, default: "" },
    spiceLevel: { type: Number, min: 0, max: 5, default: 1 },
    images: [{ type: String }],
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    popularityScore: { type: Number, default: 0 },
    recommendedPlaces: [{ type: Schema.Types.ObjectId, ref: "Place" }],
  },
  { timestamps: true },
);

foodSchema.index({ nameEnglish: "text", nameKorean: "text", description: "text" });

export const Food = mongoose.model("Food", foodSchema);
