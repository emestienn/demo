import mongoose from "mongoose";

const { Schema } = mongoose;

const collectionItemSchema = new Schema(
  {
    itemType: { type: String, enum: ["Place", "Post", "Event", "Food"], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    note: { type: String, default: "", maxlength: 300 },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const collectionSchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    description: { type: String, default: "", maxlength: 300 },
    coverImage: { type: String, default: "" },
    isPublic: { type: Boolean, default: false },
    items: [collectionItemSchema],
  },
  { timestamps: true },
);

export const Collection = mongoose.model("Collection", collectionSchema);
