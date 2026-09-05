import { Star, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { resolveImage } from "../../api/client.js";

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {eyebrow && <p className="text-xs font-semibold tracking-[0.2em] text-neon-cyan uppercase mb-1.5">{eyebrow}</p>}
        <h2 className="font-display text-2xl sm:text-3xl text-bone-50">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function RatingStars({ rating = 0, size = 13 }) {
  const { t } = useTranslation("common");
  return (
    <span className="inline-flex items-center gap-1 text-xs text-bone-200/70">
      <Star size={size} className="fill-neon-cyan text-neon-cyan" />
      {rating ? rating.toFixed(1) : t("ratingNew")}
    </span>
  );
}

export function PriceLevel({ level = 1 }) {
  return (
    <span className="text-xs text-bone-200/50 tracking-wide">
      {"₩".repeat(level)}
      <span className="opacity-30">{"₩".repeat(Math.max(0, 4 - level))}</span>
    </span>
  );
}

export function Avatar({ src, name, size = 36 }) {
  const initial = (name || "?").charAt(0).toUpperCase();
  return src ? (
    <img
      src={resolveImage(src)}
      alt={name}
      style={{ width: size, height: size }}
      className="rounded-full object-cover border border-ink-600"
    />
  ) : (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center text-xs font-semibold text-ink-950"
    >
      {initial}
    </div>
  );
}

export function CategoryChip({ category }) {
  return <span className="pill capitalize">{category?.replace(/-/g, " ")}</span>;
}

export function PlaceCard({ place, matchScore }) {
  const { t } = useTranslation("common");
  if (!place) return null;
  const image = place.images?.[0];
  return (
    <Link
      to={`/places/${place.slug}`}
      className="group card-surface overflow-hidden flex flex-col transition hover:border-neon-cyan/40 hover:shadow-glow"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-800">
        {image && (
          <img
            src={resolveImage(image)}
            alt={place.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/80 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5">
          <CategoryChip category={place.category} />
        </div>
        {matchScore != null && (
          <div className="absolute top-2.5 right-2.5 pill border-neon-cyan/50 text-neon-cyan bg-ink-950/70">{t("matchPercent", { score: matchScore })}</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col gap-1.5">
        <h3 className="font-display text-base text-bone-50 leading-snug line-clamp-1">{place.name}</h3>
        <div className="flex items-center gap-2 text-xs text-bone-200/60">
          <MapPin size={12} />
          <span className="line-clamp-1">{place.neighborhood?.name || place.neighborhood}</span>
        </div>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <RatingStars rating={place.rating} />
          <PriceLevel level={place.priceLevel} />
        </div>
      </div>
    </Link>
  );
}
