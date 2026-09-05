import mongoose from "mongoose";

const { Schema } = mongoose;

const vocabItemSchema = new Schema(
  {
    target: { type: String, required: true },
    romanization: { type: String, required: true },
    translation: { type: String, required: true },
    example: { type: String, default: "" },
  },
  { _id: false },
);

const quizQuestionSchema = new Schema(
  {
    prompt: { type: String, required: true },
    choices: [{ type: String, required: true }],
    correctIndex: { type: Number, required: true },
  },
  { _id: false },
);

const languageLessonSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    language: {
      type: String,
      enum: ["ko", "ru", "uz"],
      required: true,
      default: "ko",
    },
    category: {
      type: String,
      enum: ["alphabet", "greetings", "food", "directions", "shopping", "slang", "travel"],
      required: true,
    },
    level: { type: Number, min: 1, max: 5, default: 1 },
    order: { type: Number, default: 0 },
    description: { type: String, default: "" },
    vocabulary: [vocabItemSchema],
    quiz: [quizQuestionSchema],
    xpReward: { type: Number, default: 20 },
  },
  { timestamps: true },
);

export const LanguageLesson = mongoose.model("LanguageLesson", languageLessonSchema);
