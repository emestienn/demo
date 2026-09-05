import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { MapPin, Users } from "lucide-react";
import { citiesApi } from "../api/content.js";
import { PageLoader } from "../components/ui/Loading.jsx";

export default function CitiesList() {
  const { t } = useTranslation("explore");
  const { data, isLoading } = useQuery({ queryKey: ["cities"], queryFn: () => citiesApi.list() });

  if (isLoading) return <PageLoader />;
  const cities = data?.data || [];

  return (
    <div className="container-page py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("citiesList.eyebrow")}</p>
      <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-10">{t("citiesList.title")}</h1>

      <div className="grid sm:grid-cols-2 gap-5">
        {cities.map((city, i) => (
          <Link
            key={city._id}
            to={`/cities/${city.slug}`}
            className={`group relative overflow-hidden rounded-3xl border border-ink-700 hover:border-neon-cyan/40 transition ${
              i === 0 ? "sm:col-span-2 aspect-[21/9]" : "aspect-[16/10]"
            }`}
          >
            <img
              src={city.heroImage || `https://picsum.photos/seed/${city.slug}/1200/700`}
              alt={city.name}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <p className="text-xs uppercase tracking-widest text-neon-cyan mb-1">{city.region}</p>
              <h2 className="font-display text-3xl text-bone-50 mb-1">{city.name}</h2>
              <p className="text-sm text-bone-200/70 max-w-md mb-3 line-clamp-1">{city.tagline}</p>
              <div className="flex gap-4 text-xs text-bone-200/60">
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {t("citiesList.placesCount", { count: city.stats?.placeCount || 0 })}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {t("citiesList.neighborhoodsCount", { count: city.stats?.neighborhoodCount || 0 })}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
