import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCw, Award, Sparkles } from "lucide-react";
import { languageApi } from "../api/social.js";
import { useAuthStore } from "../stores/authStore.js";
import { PageLoader } from "../components/ui/Loading.jsx";

export default function LanguageLessonPage() {
  const { t } = useTranslation("learn");
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [mode, setMode] = useState("cards");
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["lesson", slug], queryFn: () => languageApi.getLesson(slug) });

  if (isLoading) return <PageLoader />;
  if (!data) return null;
  const { lesson } = data;

  function nextCard() {
    setFlipped(false);
    if (cardIndex < lesson.vocabulary.length - 1) {
      setCardIndex(cardIndex + 1);
    } else {
      setMode("quiz");
    }
  }

  function selectAnswer(choiceIndex) {
    const next = [...answers, choiceIndex];
    setAnswers(next);
    if (questionIndex < lesson.quiz.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      submitQuiz(next);
    }
  }

  async function submitQuiz(finalAnswers) {
    if (!user) return navigate("/login");
    setSubmitting(true);
    try {
      const res = await languageApi.submitQuiz(slug, finalAnswers);
      setResult(res);
      setMode("result");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-12 max-w-xl mx-auto">
      <Link to="/language" className="flex items-center gap-1.5 text-sm text-bone-200/60 hover:text-neon-cyan mb-8">
        <ArrowLeft size={14} /> {t("lesson.allLessons")}
      </Link>

      <h1 className="font-display text-3xl text-bone-50 mb-1.5">{lesson.title}</h1>
      <p className="text-sm text-bone-200/50 mb-8">{lesson.description}</p>

      {mode === "cards" && (
        <div>
          <div className="flex justify-between text-xs text-bone-200/40 mb-3">
            <span>{t("lesson.flashcard", { current: cardIndex + 1, total: lesson.vocabulary.length })}</span>
            <span>{t("lesson.tapToFlip")}</span>
          </div>
          <div className="[perspective:1200px]" onClick={() => setFlipped((f) => !f)}>
            <motion.div
              key={cardIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0, rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.4 }}
              className="relative h-64 rounded-3xl border border-ink-700 bg-ink-900 cursor-pointer [transform-style:preserve-3d] flex items-center justify-center text-center p-8"
            >
              <div style={{ backfaceVisibility: "hidden" }} className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${flipped ? "opacity-0" : ""}`}>
                <p className="font-display text-5xl text-bone-50 mb-3">{lesson.vocabulary[cardIndex].target}</p>
                <p className="text-neon-cyan text-sm">{lesson.vocabulary[cardIndex].romanization}</p>
              </div>
              <div
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                className={`absolute inset-0 flex flex-col items-center justify-center p-8 ${flipped ? "" : "opacity-0"}`}
              >
                <p className="font-display text-2xl text-bone-50 mb-3">{lesson.vocabulary[cardIndex].translation}</p>
                <p className="text-sm text-bone-200/50">{lesson.vocabulary[cardIndex].example}</p>
              </div>
            </motion.div>
          </div>
          <div className="flex justify-center gap-3 mt-6">
            <button onClick={() => setFlipped((f) => !f)} className="btn-ghost">
              <RotateCw size={14} /> {t("lesson.flip")}
            </button>
            <button onClick={nextCard} className="btn-primary">
              {t("lesson.next")} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {mode === "quiz" && lesson.quiz.length > 0 && (
        <div>
          <div className="flex justify-between text-xs text-bone-200/40 mb-3">
            <span>{t("lesson.question", { current: questionIndex + 1, total: lesson.quiz.length })}</span>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={questionIndex} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
              <h2 className="font-display text-xl text-bone-50 mb-5">{lesson.quiz[questionIndex].prompt}</h2>
              <div className="space-y-2.5">
                {lesson.quiz[questionIndex].choices.map((choice, i) => (
                  <button
                    key={i}
                    disabled={submitting}
                    onClick={() => selectAnswer(i)}
                    className="w-full text-left card-surface p-4 hover:border-neon-cyan/50 transition text-sm text-bone-100"
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {mode === "quiz" && lesson.quiz.length === 0 && (
        <div className="text-center py-10">
          <p className="text-bone-200/60 mb-4">{t("lesson.noQuiz")}</p>
          <Link to="/language" className="btn-primary">{t("lesson.backToLessons")}</Link>
        </div>
      )}

      {mode === "result" && result && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <Award size={40} className={`mx-auto mb-4 ${result.passed ? "text-neon-cyan" : "text-bone-200/40"}`} />
          <h2 className="font-display text-3xl text-bone-50 mb-2">{t("lesson.scorePercent", { score: result.score })}</h2>
          <p className="text-bone-200/60 mb-1">{t("lesson.correctOfTotal", { correct: result.correct, total: result.total })}</p>
          {result.passed ? (
            <p className="text-neon-cyan font-medium mb-6">
              {result.xpEarned ? t("lesson.lessonPassedWithXp", { xp: result.xpEarned }) : t("lesson.lessonPassed")}
            </p>
          ) : (
            <p className="text-bone-200/50 mb-6">{t("lesson.notPassed")}</p>
          )}
          {result.unlocked?.length > 0 && (
            <div className="flex flex-col items-center gap-2 mb-6">
              {result.unlocked.map((a) => (
                <span key={a.key} className="pill border-neon-purple/50 text-neon-purple">
                  <Sparkles size={12} /> {t("lesson.achievement", { title: a.title })}
                </span>
              ))}
            </div>
          )}
          <div className="flex justify-center gap-3">
            {!result.passed && (
              <button
                onClick={() => {
                  setAnswers([]);
                  setQuestionIndex(0);
                  setMode("quiz");
                  setResult(null);
                }}
                className="btn-ghost"
              >
                {t("lesson.retryQuiz")}
              </button>
            )}
            <Link to="/language" className="btn-primary">{t("lesson.backToLessons")}</Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}
