import mongoose from "mongoose";

const { Schema } = mongoose;

export const EVENT_TYPES = ["concert", "festival", "exhibition", "pop-up", "market", "performance", "cultural"];

const eventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: EVENT_TYPES, required: true, index: true },
    description: { type: String, default: "" },
    images: [{ type: String }],
    city: { type: Schema.Types.ObjectId, ref: "City", required: true, index: true },
    neighborhood: { type: Schema.Types.ObjectId, ref: "Neighborhood" },
    place: { type: Schema.Types.ObjectId, ref: "Place" },
    venueName: { type: String, default: "" },
    startDate: { type: Date, required: true, index: true },
    endDate: { type: Date },
    priceRange: { type: String, default: "" },
    tags: [{ type: String }],
    saveCount: { type: Number, default: 0 },
    attendeeInterestCount: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

eventSchema.index({ title: "text", description: "text", tags: "text" });

export const Event = mongoose.model("Event", eventSchema);
