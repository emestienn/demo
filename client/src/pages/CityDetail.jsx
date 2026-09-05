import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MapPin, CalendarDays, ArrowUpRight } from "lucide-react";
import { citiesApi } from "../api/content.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { PlaceCard, SectionHeading, RatingStars } from "../components/ui/Bits.jsx";
import { resolveImage } from "../api/client.js";
import { formatDate } from "../utils/format.js";

export default function CityDetail() {
  const { t } = useTranslation("explore");
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["city", slug], queryFn: () => citiesApi.get(slug) });

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  const { city, neighborhoods, topPlaces, upcomingEvents } = data;

  return (
    <div>
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden border-b border-ink-800">
        <img src={city.heroImage || `https://picsum.photos/seed/${city.slug}/1600/900`} alt={city.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/20" />
        <div className="container-page relative h-full flex flex-col justify-end pb-10">
          <p className="text-xs uppercase tracking-widest text-neon-cyan mb-2">{city.region}</p>
          <h1 className="font-display text-5xl sm:text-6xl text-bone-50 mb-3">{city.name}</h1>
          <p className="text-bone-200/70 max-w-xl">{city.tagline}</p>
          <div className="flex flex-wrap gap-6 mt-6 text-sm text-bone-200/60">
            <Stat label={t("cityDetail.stats.neighborhoods")} value={city.stats?.neighborhoodCount} />
            <Stat label={t("cityDetail.stats.places")} value={city.stats?.placeCount} />
            <Stat label={t("cityDetail.stats.avgRating")} value={city.stats?.avgRating?.toFixed(1)} />
            <Stat label={t("cityDetail.stats.bestSeason")} value={city.bestSeason} />
          </div>
        </div>
      </div>

      <div className="container-page py-14 space-y-16">
        <section>
          <p className="text-bone-200/70 max-w-3xl leading-relaxed">{city.description}</p>
          {city.highlights?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {city.highlights.map((h) => (
                <span key={h} className="pill">{h}</span>
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionHeading eyebrow={t("cityDetail.whereToGoEyebrow")} title={t("cityDetail.neighborhoodsTitle")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {neighborhoods.map((n) => (
              <Link
                key={n._id}
                to={`/neighborhoods/${n.slug}`}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-ink-700 hover:border-neon-cyan/40 transition"
              >
                <img src={n.heroImage} alt={n.name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display text-lg text-bone-50">{n.name}</h3>
                  <p className="text-xs text-bone-200/60 line-clamp-1">{n.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {topPlaces?.length > 0 && (
          <section>
            <SectionHeading eyebrow={t("cityDetail.topRatedEyebrow")} title={t("cityDetail.placesTitle")} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {topPlaces.map((p) => (
                <PlaceCard key={p._id} place={p} />
              ))}
            </div>
          </section>
        )}

        {upcomingEvents?.length > 0 && (
          <section>
            <SectionHeading eyebrow={t("cityDetail.happeningSoonEyebrow")} title={t("cityDetail.eventsTitle")} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((e) => (
                <Link key={e._id} to={`/events/${e.slug}`} className="card-surface p-5 hover:border-neon-purple/40 transition">
                  <p className="text-xs text-neon-purple font-semibold flex items-center gap-1.5 mb-2">
                    <CalendarDays size={12} /> {formatDate(e.startDate)}
                  </p>
                  <h3 className="font-display text-base text-bone-50 line-clamp-1">{e.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div>
      <p className="font-display text-xl text-bone-50">{value}</p>
      <p className="text-xs text-bone-200/50">{label}</p>
    </div>
  );
}
