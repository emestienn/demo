import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Flame, GraduationCap, Lock, Bookmark, Compass, MessageCircle, Star, FolderHeart, Users, Award } from "lucide-react";
import { languageApi, achievementsApi } from "../api/social.js";
import { useAuthStore } from "../stores/authStore.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { SectionHeading } from "../components/ui/Bits.jsx";

const ACHIEVEMENT_ICONS = {
  bookmark: Bookmark,
  compass: Compass,
  "message-circle": MessageCircle,
  star: Star,
  "folder-heart": FolderHeart,
  "graduation-cap": GraduationCap,
  users: Users,
  flame: Flame,
};

const CATEGORY_KEYS = ["alphabet", "greetings", "food", "directions", "shopping", "slang", "travel"];
const LANGUAGE_CODES = ["ko", "ru", "uz"];

export default function LanguageHome() {
  const { t } = useTranslation("learn");
  const user = useAuthStore((s) => s.user);
  const [language, setLanguage] = useState("ko");
  const { data: lessons, isLoading } = useQuery({
    queryKey: ["lessons", language],
    queryFn: () => languageApi.listLessons({ language }),
  });
  const { data: achievements } = useQuery({ queryKey: ["achievements"], queryFn: achievementsApi.list });

  const LANGUAGES = LANGUAGE_CODES.map((code) => ({
    code,
    label: t(`languages.${code}.label`),
    eyebrow: t(`languages.${code}.eyebrow`),
    title: t(`languages.${code}.title`),
  }));
  const active = LANGUAGES.find((l) => l.code === language);
  const completedCount = lessons?.filter((l) => l.progress?.status === "completed").length || 0;

  return (
    <div className="container-page py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{active.eyebrow}</p>
      <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-6">{active.title}</h1>

      <div className="flex gap-2 mb-8">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`pill ${language === l.code ? "border-neon-cyan text-neon-cyan" : ""}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageLoader />
      ) : (
        <>
      {user && (
        <div className="grid sm:grid-cols-3 gap-4 mb-10">
          <StatCard icon={GraduationCap} label={t("home.lessonsCompleted")} value={`${completedCount}/${lessons?.length || 0}`} />
          <StatCard icon={Flame} label={t("home.dayStreak")} value={user.streak?.count || 0} />
          <StatCard icon={CheckCircle2} label={t("home.level")} value={t("home.levelValue", { level: user.level })} sub={t("home.xpValue", { xp: user.xp })} />
        </div>
      )}

      <SectionHeading eyebrow={t("home.curriculumEyebrow")} title={t("home.lessonsTitle")} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
        {lessons?.map((lesson) => (
          <Link
            key={lesson._id}
            to={`/language/${lesson.slug}`}
            className="card-surface p-5 hover:border-neon-cyan/40 transition flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="pill">{t(`categories.${lesson.category}`)}</span>
              {lesson.progress?.status === "completed" && <CheckCircle2 size={16} className="text-neon-cyan" />}
            </div>
            <h3 className="font-display text-lg text-bone-50 mb-1.5">{lesson.title}</h3>
            <p className="text-sm text-bone-200/50 line-clamp-2 mb-3">{lesson.description}</p>
            <div className="mt-auto flex items-center justify-between text-xs text-bone-200/40">
              <span>{t("home.wordsCount", { count: lesson.vocabularyCount, level: lesson.level })}</span>
              <span className="text-neon-cyan font-medium">{t("home.xpReward", { xp: lesson.xpReward })}</span>
            </div>
          </Link>
        ))}
      </div>

      {achievements && (
        <>
          <SectionHeading eyebrow={t("home.milestonesEyebrow")} title={t("home.achievementsTitle")} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {achievements.map((a) => {
              const Icon = ACHIEVEMENT_ICONS[a.icon] || Award;
              return (
                <div
                  key={a.key}
                  className={`card-surface p-4 flex flex-col items-center text-center gap-2 ${a.unlocked ? "" : "opacity-40"}`}
                >
                  {a.unlocked ? <Icon size={22} className="text-neon-cyan" /> : <Lock size={20} className="text-bone-200/40" />}
                  <p className="text-sm font-medium text-bone-100">{a.title}</p>
                  <p className="text-xs text-bone-200/50">{a.description}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="card-surface p-5 flex items-center gap-4">
      <div className="h-11 w-11 rounded-xl bg-ink-800 flex items-center justify-center text-neon-cyan">
        <Icon size={20} />
      </div>
      <div>
        <p className="font-display text-xl text-bone-50">{value}</p>
        <p className="text-xs text-bone-200/50">{sub || label}</p>
      </div>
    </div>
  );
}
