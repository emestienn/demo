import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { useTranslation } from "react-i18next";
import { foodApi } from "../api/content.js";
import { FOOD_CATEGORIES } from "../constants/categories.js";
import { PageLoader, SkeletonGrid } from "../components/ui/Loading.jsx";
import { resolveImage } from "../api/client.js";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function FoodList() {
  const { t } = useTranslation("food");
  const [category, setCategory] = useState("");
  const [spiceMax, setSpiceMax] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["food", category, spiceMax],
    queryFn: () => foodApi.list({ category: category || undefined, spiceMax: spiceMax || undefined, limit: 40 }),
  });

  return (
    <div className="container-page py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("list.eyebrow")}</p>
      <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-8">{t("list.title")}</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setCategory("")} className={`pill ${!category ? "border-neon-cyan text-neon-cyan" : ""}`}>
          {t("filters.all")}
        </button>
        {FOOD_CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`pill capitalize ${category === c ? "border-neon-cyan text-neon-cyan" : ""}`}
          >
            {t(`categories.${c}`)}
          </button>
        ))}
        <select className="input-field !w-auto !py-1.5 ml-auto" value={spiceMax} onChange={(e) => setSpiceMax(e.target.value)}>
          <option value="">{t("filters.spiceAny")}</option>
          <option value="0">{t("filters.spiceNone")}</option>
          <option value="2">{t("filters.spiceMild")}</option>
          <option value="4">{t("filters.spiceMedium")}</option>
        </select>
      </div>

      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.data?.map((f) => (
            <Link key={f._id} to={`/food/${f.slug}`} className="group card-surface overflow-hidden hover:border-neon-cyan/40 transition">
              <div className="relative aspect-[4/3] overflow-hidden bg-ink-800">
                {f.images?.[0] && (
                  <img src={resolveImage(f.images[0])} alt={f.nameEnglish} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                )}
                {f.spiceLevel > 0 && (
                  <div className="absolute top-2.5 right-2.5 pill bg-ink-950/70 border-neon-pink/40 text-neon-pink">
                    <Flame size={11} /> {f.spiceLevel}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-display text-base text-bone-50 line-clamp-1">{f.nameEnglish}</h3>
                <p className="text-sm text-bone-200/50">{f.nameKorean}</p>
                <p className="text-xs text-bone-200/40 mt-1.5">{f.priceRange}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {!isLoading && !data?.data?.length && <EmptyState title={t("empty.title")} description={t("empty.description")} />}
    </div>
  );
}
