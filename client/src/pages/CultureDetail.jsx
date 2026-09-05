import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cultureApi } from "../api/content.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { SectionHeading, PlaceCard } from "../components/ui/Bits.jsx";
import { resolveImage } from "../api/client.js";

export default function CultureDetail() {
  const { t } = useTranslation(["culture", "common"]);
  const { slug } = useParams();
  const { data: item, isLoading } = useQuery({ queryKey: ["culture", slug], queryFn: () => cultureApi.get(slug) });

  if (isLoading) return <PageLoader />;
  if (!item) return null;

  return (
    <div>
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden border-b border-ink-800">
        {item.images?.[0] && <img src={resolveImage(item.images[0])} alt={item.title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10" />
        <div className="container-page relative h-full flex flex-col justify-end pb-9">
          <p className="text-xs uppercase tracking-widest text-neon-purple mb-2">{t(`culture:categories.${item.type}`)}</p>
          <h1 className="font-display text-4xl sm:text-5xl text-bone-50 max-w-2xl mb-2">{item.title}</h1>
          {item.relatedNeighborhood && (
            <Link to={`/neighborhoods/${item.relatedNeighborhood.slug}`} className="text-sm text-bone-200/60 hover:text-neon-cyan w-fit">
              {item.relatedNeighborhood.name}
            </Link>
          )}
        </div>
      </div>

      <div className="container-page py-12 max-w-3xl space-y-8">
        <p className="text-bone-200/70 leading-relaxed text-lg">{item.summary}</p>
        <p className="text-bone-200/60 leading-relaxed">{item.body}</p>
        <div className="flex flex-wrap gap-2">
          {item.tags?.map((t) => (
            <span key={t} className="pill">{t}</span>
          ))}
        </div>

        {item.relatedPlaces?.length > 0 && (
          <section className="pt-4">
            <SectionHeading eyebrow={t("culture:detail.relatedPlacesEyebrow")} title={t("culture:detail.relatedPlacesTitle")} />
            <div className="grid sm:grid-cols-2 gap-4">
              {item.relatedPlaces.map((p) => (
                <PlaceCard key={p._id} place={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
