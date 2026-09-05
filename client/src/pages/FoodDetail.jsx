import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Flame, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { foodApi } from "../api/content.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { SectionHeading, PlaceCard, RatingStars } from "../components/ui/Bits.jsx";
import { resolveImage } from "../api/client.js";

export default function FoodDetail() {
  const { t } = useTranslation("food");
  const { slug } = useParams();
  const { data: food, isLoading } = useQuery({ queryKey: ["food", slug], queryFn: () => foodApi.get(slug) });

  if (isLoading) return <PageLoader />;
  if (!food) return null;

  return (
    <div>
      <div className="relative h-[42vh] min-h-[300px] overflow-hidden border-b border-ink-800">
        {food.images?.[0] && <img src={resolveImage(food.images[0])} alt={food.nameEnglish} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/10" />
        <div className="container-page relative h-full flex flex-col justify-end pb-8">
          <p className="text-xs uppercase tracking-widest text-neon-cyan mb-2">{t(`categories.${food.category}`, { defaultValue: food.category?.replace(/-/g, " ") })}</p>
          <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-1">{food.nameEnglish}</h1>
          <p className="text-lg text-bone-200/60">{food.nameKorean}</p>
        </div>
      </div>

      <div className="container-page py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <p className="text-bone-200/70 leading-relaxed">{food.description}</p>
          {food.recommendedPlaces?.length > 0 && (
            <section>
              <SectionHeading eyebrow={t("detail.tryItHere")} title={t("detail.recommendedPlaces")} />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {food.recommendedPlaces.map((p) => (
                  <PlaceCard key={p._id} place={p} />
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="card-surface p-5 space-y-3 h-fit">
          <InfoRow label={t("info.origin")} value={food.origin} />
          <InfoRow label={t("info.region")} value={food.region} />
          <InfoRow label={t("info.priceRange")} value={food.priceRange} />
          <InfoRow
            label={t("info.spiceLevel")}
            value={
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Flame key={i} size={13} className={i < food.spiceLevel ? "fill-neon-pink text-neon-pink" : "text-ink-600"} />
                ))}
              </span>
            }
          />
          <InfoRow label={t("info.rating")} value={<RatingStars rating={food.rating} />} />
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-bone-200/50">{label}</span>
      <span className="text-bone-100 font-medium">{value}</span>
    </div>
  );
}
