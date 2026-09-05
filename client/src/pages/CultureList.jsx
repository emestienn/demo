import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cultureApi } from "../api/content.js";
import { CULTURE_TYPES } from "../constants/categories.js";
import { SkeletonGrid } from "../components/ui/Loading.jsx";
import { resolveImage } from "../api/client.js";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function CultureList() {
  const { t } = useTranslation(["culture", "common"]);
  const [type, setType] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["culture", type],
    queryFn: () => cultureApi.list({ type: type || undefined, limit: 40 }),
  });

  return (
    <div className="container-page py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("culture:eyebrow")}</p>
      <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-8">{t("culture:title")}</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setType("")} className={`pill ${!type ? "border-neon-cyan text-neon-cyan" : ""}`}>{t("culture:filters.all")}</button>
        {CULTURE_TYPES.map((t2) => (
          <button key={t2} onClick={() => setType(t2)} className={`pill capitalize ${type === t2 ? "border-neon-cyan text-neon-cyan" : ""}`}>
            {t(`culture:categories.${t2}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <SkeletonGrid count={9} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.data?.map((c) => (
            <Link key={c._id} to={`/culture/${c.slug}`} className="group card-surface overflow-hidden hover:border-neon-purple/40 transition">
              <div className="relative aspect-[16/10] overflow-hidden bg-ink-800">
                {c.images?.[0] && (
                  <img src={resolveImage(c.images[0])} alt={c.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                )}
                <div className="absolute top-3 left-3 pill bg-ink-950/70 capitalize">{t(`culture:categories.${c.type}`)}</div>
              </div>
              <div className="p-5">
                <h3 className="font-display text-lg text-bone-50 mb-1.5 line-clamp-2">{c.title}</h3>
                <p className="text-sm text-bone-200/50 line-clamp-2">{c.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!isLoading && !data?.data?.length && <EmptyState title={t("common:empty.nothingHere")} />}
    </div>
  );
}
