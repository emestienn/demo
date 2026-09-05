import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bookmark } from "lucide-react";
import { usersApi } from "../api/social.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { PlaceCard } from "../components/ui/Bits.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function SavedPlaces() {
  const { t } = useTranslation("explore");
  const { data, isLoading } = useQuery({ queryKey: ["saved-places"], queryFn: usersApi.listSavedPlaces });

  if (isLoading) return <PageLoader />;

  return (
    <div className="container-page py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("savedPlaces.eyebrow")}</p>
      <h1 className="font-display text-4xl text-bone-50 mb-8">{t("savedPlaces.title")}</h1>

      {data?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((p) => (
            <PlaceCard key={p._id} place={p} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Bookmark} title={t("savedPlaces.emptyTitle")} description={t("savedPlaces.emptyDescription")} />
      )}
    </div>
  );
}
