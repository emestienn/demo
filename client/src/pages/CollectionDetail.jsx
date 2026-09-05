import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { collectionsApi } from "../api/social.js";
import { useAuthStore } from "../stores/authStore.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { resolveImage } from "../api/client.js";
import EmptyState from "../components/ui/EmptyState.jsx";

const ROUTES = { Place: "places", Post: "community", Event: "events", Food: "food" };

export default function CollectionDetail() {
  const { t } = useTranslation(["profile", "common"]);
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const { data: collection, isLoading, error } = useQuery({ queryKey: ["collection", id], queryFn: () => collectionsApi.get(id) });

  if (isLoading) return <PageLoader />;
  if (error) return <div className="container-page py-20 text-center text-bone-200/60">{t("profile:collectionDetail.privateMessage")}</div>;
  if (!collection) return null;

  const isOwner = user?.id === collection.owner?._id;

  async function handleRemove(itemId) {
    await collectionsApi.removeItem(id, itemId);
    queryClient.invalidateQueries({ queryKey: ["collection", id] });
  }

  return (
    <div className="container-page py-12">
      <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{t("profile:collectionDetail.eyebrow", { name: collection.owner?.displayName })}</p>
      <h1 className="font-display text-4xl text-bone-50 mb-2">{collection.name}</h1>
      {collection.description && <p className="text-bone-200/60 max-w-xl mb-8">{collection.description}</p>}

      {collection.items?.length ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collection.items.map((item) => {
            const d = item.data;
            const title = d.name || d.title || d.nameEnglish || d.text?.slice(0, 40);
            const image = d.images?.[0];
            return (
              <div key={item._id} className="relative group">
                <Link to={`/${ROUTES[item.itemType]}/${d.slug || ""}`} className="card-surface overflow-hidden block hover:border-neon-cyan/40 transition">
                  {image && <img src={resolveImage(image)} alt={title} className="aspect-[4/3] w-full object-cover" />}
                  <div className="p-4">
                    <p className="text-xs text-bone-200/40 uppercase tracking-wide mb-1">{t(`profile:itemTypes.${item.itemType}`, item.itemType)}</p>
                    <p className="text-bone-100 font-medium line-clamp-1">{title}</p>
                    {item.note && <p className="text-xs text-bone-200/50 mt-1 line-clamp-2">{item.note}</p>}
                  </div>
                </Link>
                {isOwner && (
                  <button
                    onClick={() => handleRemove(item._id)}
                    className="absolute top-2 right-2 h-7 w-7 rounded-full bg-ink-950/80 flex items-center justify-center text-bone-200/70 hover:text-neon-pink opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState title={t("profile:collectionDetail.emptyTitle")} description={t("profile:collectionDetail.emptyDescription")} />
      )}
    </div>
  );
}
