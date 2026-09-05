import mongoose from "mongoose";

const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true, index: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 1000 },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const Comment = mongoose.model("Comment", commentSchema);
