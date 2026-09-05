import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, MapPin, UtensilsCrossed, CalendarDays, Languages } from "lucide-react";
import { aiApi } from "../api/content.js";
import { Spinner } from "../components/ui/Loading.jsx";
import { getApiErrorMessage } from "../api/client.js";
import { formatDate } from "../utils/format.js";

export default function AiAssistant() {
  const { t } = useTranslation("ai");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const PROMPTS = [
    t("prompts.seoulFashion"),
    t("prompts.busanBeach"),
    t("prompts.gangnamLuxury"),
    t("prompts.hongdaeMusic"),
  ];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await aiApi.itinerary(prompt.trim());
      setResult(data);
    } catch (err) {
      setError(getApiErrorMessage(err, t("errorFallback")));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page py-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-2.5 mb-2">
        <Sparkles size={18} className="text-neon-cyan" />
        <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan">{t("eyebrow")}</p>
      </div>
      <h1 className="font-display text-4xl text-bone-50 mb-3">{t("heading")}</h1>
      <p className="text-bone-200/60 mb-8">
        {t("subheading")}
      </p>

      <form onSubmit={handleSubmit} className="relative mb-4">
        <input
          className="input-field !pr-14 !py-4 text-base"
          placeholder={t("inputPlaceholder")}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-neon-cyan text-ink-950"
        >
          {loading ? <Spinner size={16} /> : <Send size={15} />}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-10">
        {PROMPTS.map((p) => (
          <button key={p} onClick={() => setPrompt(p)} className="pill hover:border-neon-cyan/50 hover:text-neon-cyan">
            {p}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-neon-pink mb-6">{error}</p>}

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="card-surface p-6">
              <p className="text-bone-100 leading-relaxed">{result.summary}</p>
              {result.aiEnhanced && <p className="text-xs text-neon-purple mt-3">{t("aiEnhanced")}</p>}
            </div>

            {result.stops?.length > 0 && (
              <div>
                <h2 className="font-display text-xl text-bone-50 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-neon-cyan" /> {t("sections.route")}
                </h2>
                <div className="space-y-3">
                  {result.stops.map((stop, i) => (
                    <Link
                      key={stop.placeId}
                      to={`/places/${stop.slug}`}
                      className="flex gap-4 card-surface p-4 hover:border-neon-cyan/40 transition"
                    >
                      <div className="shrink-0 h-8 w-8 rounded-full bg-ink-800 flex items-center justify-center text-xs font-semibold text-neon-cyan">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-xs text-neon-cyan font-semibold mb-0.5">{stop.time}</p>
                        <p className="text-bone-100 font-medium">{stop.name}</p>
                        <p className="text-sm text-bone-200/50">{stop.why}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.food?.length > 0 && (
              <div>
                <h2 className="font-display text-xl text-bone-50 mb-4 flex items-center gap-2">
                  <UtensilsCrossed size={18} className="text-neon-pink" /> {t("sections.food")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.food.map((f) => (
                    <Link key={f.id} to={`/food/${f.slug}`} className="pill hover:border-neon-pink/50 hover:text-neon-pink">
                      {f.nameEnglish}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.events?.length > 0 && (
              <div>
                <h2 className="font-display text-xl text-bone-50 mb-4 flex items-center gap-2">
                  <CalendarDays size={18} className="text-neon-purple" /> {t("sections.events")}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.events.map((e) => (
                    <Link key={e.id} to={`/events/${e.slug}`} className="pill hover:border-neon-purple/50 hover:text-neon-purple">
                      {e.title} · {formatDate(e.startDate)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {result.phrases?.length > 0 && (
              <div>
                <h2 className="font-display text-xl text-bone-50 mb-4 flex items-center gap-2">
                  <Languages size={18} className="text-neon-cyan" /> {t("sections.phrases")}
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {result.phrases.map((p) => (
                    <div key={p.korean} className="card-surface p-4">
                      <p className="font-display text-lg text-bone-50">{p.korean}</p>
                      <p className="text-xs text-neon-cyan">{p.romanization}</p>
                      <p className="text-sm text-bone-200/60 mt-1">{p.english}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
