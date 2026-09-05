import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin } from "lucide-react";
import { eventsApi, citiesApi } from "../api/content.js";
import { EVENT_TYPES } from "../constants/categories.js";
import { SkeletonGrid } from "../components/ui/Loading.jsx";
import { resolveImage } from "../api/client.js";
import { formatDate } from "../utils/format.js";
import EmptyState from "../components/ui/EmptyState.jsx";

const EVENT_TYPE_KEYS = {
  "pop-up": "popUp",
};

export default function EventsList() {
  const { t } = useTranslation(["events", "common"]);
  const [type, setType] = useState("");
  const [cityId, setCityId] = useState("");

  const { data: cities } = useQuery({ queryKey: ["cities"], queryFn: () => citiesApi.list() });
  const { data, isLoading } = useQuery({
    queryKey: ["events", type, cityId],
    queryFn: () => eventsApi.list({ type: type || undefined, city: cityId || undefined, upcoming: "true", limit: 40 }),
  });

  return (
    <div className="container-page py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("events:eyebrow")}</p>
      <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-8">{t("events:title")}</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setType("")} className={`pill ${!type ? "border-neon-cyan text-neon-cyan" : ""}`}>{t("events:filters.allTypes")}</button>
        {EVENT_TYPES.map((eventType) => (
          <button key={eventType} onClick={() => setType(eventType)} className={`pill capitalize ${type === eventType ? "border-neon-cyan text-neon-cyan" : ""}`}>
            {t(`events:types.${EVENT_TYPE_KEYS[eventType] || eventType}`)}
          </button>
        ))}
        <select className="input-field !w-auto !py-1.5 ml-auto" value={cityId} onChange={(e) => setCityId(e.target.value)}>
          <option value="">{t("events:filters.allCities")}</option>
          {(cities?.data || []).map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.data?.map((e) => (
            <Link key={e._id} to={`/events/${e.slug}`} className="group card-surface overflow-hidden hover:border-neon-purple/40 transition">
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
                {e.images?.[0] && (
                  <img src={resolveImage(e.images[0])} alt={e.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                )}
                <div className="absolute top-3 left-3 pill bg-ink-950/70 border-neon-purple/40 text-neon-purple">
                  <CalendarDays size={11} /> {formatDate(e.startDate)}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-bone-50 mb-1.5 line-clamp-1">{e.title}</h3>
                <p className="text-sm text-bone-200/50 flex items-center gap-1.5">
                  <MapPin size={12} /> {e.neighborhood?.name || e.city?.name}
                </p>
                <p className="text-xs text-bone-200/40 mt-2">{e.priceRange}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!isLoading && !data?.data?.length && <EmptyState title={t("events:empty.title")} description={t("events:empty.description")} />}
    </div>
  );
}
