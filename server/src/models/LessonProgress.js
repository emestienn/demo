import mongoose from "mongoose";

const { Schema } = mongoose;

const lessonProgressSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lesson: { type: Schema.Types.ObjectId, ref: "LanguageLesson", required: true },
    status: { type: String, enum: ["in_progress", "completed"], default: "in_progress" },
    bestScore: { type: Number, default: 0 },
    attempts: { type: Number, default: 0 },
    xpEarned: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

lessonProgressSchema.index({ user: 1, lesson: 1 }, { unique: true });

export const LessonProgress = mongoose.model("LessonProgress", lessonProgressSchema);
