import { LanguageLesson } from "../models/LanguageLesson.js";
import { LessonProgress } from "../models/LessonProgress.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { addXp, checkAndUnlockAchievements } from "../services/gamification.service.js";
import { logActivity } from "../services/activity.service.js";

export const listLessons = asyncHandler(async (req, res) => {
  const { category, language } = req.query;
  const filter = { ...(category ? { category } : {}), ...(language ? { language } : {}) };
  const lessons = await LanguageLesson.find(filter).sort({ level: 1, order: 1 });

  let progressByLesson = {};
  if (req.user) {
    const progress = await LessonProgress.find({ user: req.user._id });
    progressByLesson = Object.fromEntries(progress.map((p) => [String(p.lesson), p]));
  }

  const data = lessons.map((lesson) => ({
    ...lesson.toObject(),
    vocabulary: undefined,
    quiz: undefined,
    vocabularyCount: lesson.vocabulary.length,
    questionCount: lesson.quiz.length,
    progress: progressByLesson[String(lesson._id)] || null,
  }));

  res.json({ success: true, data });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await LanguageLesson.findOne({ slug: req.params.slug });
  if (!lesson) throw ApiError.notFound("Lesson not found");

  let progress = null;
  if (req.user) {
    progress = await LessonProgress.findOne({ user: req.user._id, lesson: lesson._id });
  }

  res.json({ success: true, data: { lesson, progress } });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const lesson = await LanguageLesson.findOne({ slug: req.params.slug });
  if (!lesson) throw ApiError.notFound("Lesson not found");

  const { answers } = req.body;
  let correct = 0;
  lesson.quiz.forEach((question, index) => {
    if (answers[index] === question.correctIndex) correct += 1;
  });
  const score = lesson.quiz.length ? Math.round((correct / lesson.quiz.length) * 100) : 100;
  const passed = score >= 70;

  let progress = await LessonProgress.findOne({ user: req.user._id, lesson: lesson._id });
  if (!progress) {
    progress = new LessonProgress({ user: req.user._id, lesson: lesson._id });
  }

  progress.attempts += 1;
  progress.bestScore = Math.max(progress.bestScore, score);
  let xpEarned = 0;

  if (passed && progress.status !== "completed") {
    progress.status = "completed";
    progress.completedAt = new Date();
    xpEarned = lesson.xpReward;
    progress.xpEarned += xpEarned;
    await addXp(req.user._id, xpEarned);
    await logActivity({ user: req.user._id, type: "complete_lesson", meta: { lessonId: lesson._id } });
  }

  await progress.save();
  const unlocked = await checkAndUnlockAchievements(req.user._id);

  res.json({ success: true, data: { score, passed, correct, total: lesson.quiz.length, xpEarned, progress, unlocked } });
});

export const getProgressSummary = asyncHandler(async (req, res) => {
  const [totalLessons, progress] = await Promise.all([
    LanguageLesson.countDocuments(),
    LessonProgress.find({ user: req.user._id }).populate("lesson", "title category level xpReward"),
  ]);

  const completed = progress.filter((p) => p.status === "completed");
  res.json({
    success: true,
    data: {
      totalLessons,
      completedCount: completed.length,
      totalXpFromLessons: completed.reduce((sum, p) => sum + p.xpEarned, 0),
      progress,
    },
  });
});
