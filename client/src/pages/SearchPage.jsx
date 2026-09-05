import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Search as SearchIcon } from "lucide-react";
import { searchApi } from "../api/content.js";
import { useDebouncedValue } from "../hooks/useDebouncedValue.js";
import { resolveImage } from "../api/client.js";
import { Spinner } from "../components/ui/Loading.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

const SECTIONS = [
  { key: "places", labelKey: "sectionLabels.places", to: (i) => `/places/${i.slug}`, primary: (i) => i.name },
  { key: "neighborhoods", labelKey: "sectionLabels.neighborhoods", to: (i) => `/neighborhoods/${i.slug}`, primary: (i) => i.name },
  { key: "cities", labelKey: "sectionLabels.cities", to: (i) => `/cities/${i.slug}`, primary: (i) => i.name },
  { key: "food", labelKey: "sectionLabels.food", to: (i) => `/food/${i.slug}`, primary: (i) => i.nameEnglish },
  { key: "events", labelKey: "sectionLabels.events", to: (i) => `/events/${i.slug}`, primary: (i) => i.title },
  { key: "culture", labelKey: "sectionLabels.culture", to: (i) => `/culture/${i.slug}`, primary: (i) => i.title },
];

export default function SearchPage() {
  const { t } = useTranslation("discover");
  const [q, setQ] = useState("");
  const debouncedQ = useDebouncedValue(q, 350);

  const { data, isFetching } = useQuery({
    queryKey: ["search", debouncedQ],
    queryFn: () => searchApi.search(debouncedQ),
    enabled: debouncedQ.trim().length >= 2,
  });

  const totalResults = data ? Object.values(data).reduce((sum, arr) => sum + arr.length, 0) : 0;

  return (
    <div className="container-page py-12 max-w-3xl mx-auto">
      <div className="relative mb-10">
        <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-bone-200/40" />
        <input
          autoFocus
          className="input-field !pl-11 !py-4 text-lg"
          placeholder={t("search.placeholder")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {isFetching && <Spinner size={18} className="absolute right-4 top-1/2 -translate-y-1/2" />}
      </div>

      {debouncedQ.trim().length < 2 && (
        <EmptyState icon={SearchIcon} title={t("search.emptyTitle")} description={t("search.emptyDescription")} />
      )}

      {debouncedQ.trim().length >= 2 && data && totalResults === 0 && (
        <EmptyState title={t("search.noResultsTitle", { query: debouncedQ })} description={t("search.noResultsDescription")} />
      )}

      <div className="space-y-8">
        {SECTIONS.map(({ key, labelKey, to, primary }) => {
          const items = data?.[key] || [];
          if (!items.length) return null;
          return (
            <div key={key}>
              <p className="text-xs font-semibold tracking-widest text-bone-200/50 uppercase mb-3">{t(labelKey)}</p>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <Link key={item._id} to={to(item)} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-900">
                    {item.images?.[0] && (
                      <img src={resolveImage(item.images[0])} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    )}
                    <span className="text-sm text-bone-100">{primary(item)}</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
