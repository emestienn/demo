import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Sparkles, MessageCircle, Languages } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { citiesApi } from "../api/content.js";
import { useAuthStore } from "../stores/authStore.js";
import { Navigate } from "react-router-dom";

const FEATURE_ICONS = [MapPin, Sparkles, MessageCircle, Languages];
const FEATURE_KEYS = ["neighborhoodIntel", "personalizedDiscovery", "aiAssistant", "koreanOnGo"];

export default function Landing() {
  const { t } = useTranslation(["landing", "common"]);
  const token = useAuthStore((s) => s.token);
  const { data: cities } = useQuery({ queryKey: ["cities"], queryFn: () => citiesApi.list() });

  const features = FEATURE_KEYS.map((key, i) => ({
    icon: FEATURE_ICONS[i],
    title: t(`features.${key}.title`),
    desc: t(`features.${key}.desc`),
  }));

  if (token) return <Navigate to="/discover" replace />;

  return (
    <div>
      <section className="relative overflow-hidden bg-grid-fade border-b border-ink-800">
        <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-neon-purple/10 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-neon-cyan/10 blur-[120px]" />
        <div className="container-page relative py-24 sm:py-32">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-6"
          >
            {t("hero.eyebrow")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl leading-[0.95] max-w-4xl text-bone-50"
          >
            {t("hero.titlePart1")}<span className="text-gradient">{t("hero.titleHighlight")}</span>{t("hero.titlePart2")}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-lg text-bone-200/70 max-w-xl"
          >
            {t("hero.subheadline")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link to="/register" className="btn-primary !px-7 !py-3.5 text-base">
              {t("hero.ctaExplore")} <ArrowUpRight size={16} />
            </Link>
            <Link to="/map" className="btn-ghost !px-7 !py-3.5 text-base">
              {t("hero.ctaMap")}
            </Link>
          </motion.div>
        </div>

        <div className="overflow-hidden border-t border-ink-800 py-4">
          <div className="flex gap-10 animate-marquee whitespace-nowrap text-sm text-bone-200/30 font-display tracking-wide">
            {[...Array(2)].flatMap((_, rep) =>
              ["SEOUL", "BUSAN", "INCHEON", "DAEGU", "DAEJEON", "GWANGJU", "JEJU", "HONGDAE", "GANGNAM", "ITAEWON"].map((c) => (
                <span key={`${rep}-${c}`}>{c}</span>
              )),
            )}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card-surface p-6 hover:border-neon-cyan/30 transition">
              <f.icon size={22} className="text-neon-cyan mb-4" />
              <h3 className="font-display text-lg text-bone-50 mb-1.5">{f.title}</h3>
              <p className="text-sm text-bone-200/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-24">
        <div className="flex items-end justify-between mb-6">
          <h2 className="font-display text-3xl text-bone-50">{t("cities.heading")}</h2>
          <Link to="/cities" className="text-sm text-neon-cyan flex items-center gap-1">
            {t("common:actions.seeAll")} <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(cities?.data || []).slice(0, 8).map((city) => (
            <Link
              key={city._id}
              to={`/cities/${city.slug}`}
              className="group relative aspect-square rounded-2xl overflow-hidden border border-ink-700"
            >
              <img
                src={city.heroImage || `https://picsum.photos/seed/${city.slug}/600/600`}
                alt={city.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/10 to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="font-display text-lg text-bone-50">{city.name}</p>
                <p className="text-xs text-bone-200/60">{t("cities.placesCount", { count: city.stats?.placeCount || 0 })}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
