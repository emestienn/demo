import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Bookmark, FolderPlus, MapPin, Star, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { placesApi } from "../api/content.js";
import { usersApi } from "../api/social.js";
import { useAuthStore } from "../stores/authStore.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { SectionHeading, RatingStars, PriceLevel, CategoryChip, Avatar, PlaceCard } from "../components/ui/Bits.jsx";
import { resolveImage, getApiErrorMessage } from "../api/client.js";
import { toast } from "../stores/toastStore.js";
import { timeAgo } from "../utils/format.js";
import PlaceMiniMap from "../components/map/PlaceMiniMap.jsx";
import AddToCollectionModal from "../components/collections/AddToCollectionModal.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function PlaceDetail() {
  const { t } = useTranslation(["explore", "common"]);
  const { slug } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["place", slug], queryFn: () => placesApi.get(slug) });

  const savedIds = useQuery({
    queryKey: ["saved-places", "ids"],
    queryFn: () => usersApi.listSavedPlaces().then((list) => list.map((p) => p._id)),
    enabled: Boolean(user),
  });

  if (isLoading) return <PageLoader />;
  if (!data) return null;
  const { place, reviews, nearby, food, events } = data;
  const isSaved = savedIds.data?.includes(place._id);

  async function handleSave() {
    if (!user) return navigate("/login");
    try {
      await usersApi.toggleSavePlace(place._id);
      queryClient.invalidateQueries({ queryKey: ["saved-places"] });
      toast(isSaved ? t("explore:placeDetail.removedFromSaved") : t("explore:placeDetail.savedToAccount"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!user) return navigate("/login");
    setSubmittingReview(true);
    try {
      await placesApi.createReview(place._id, reviewForm);
      queryClient.invalidateQueries({ queryKey: ["place", slug] });
      setReviewForm({ rating: 5, text: "" });
      toast(t("explore:placeDetail.reviewPosted"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err, t("explore:placeDetail.reviewError")), "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div>
      <div className="relative h-[52vh] min-h-[380px] overflow-hidden border-b border-ink-800">
        {place.images?.[0] && (
          <img src={resolveImage(place.images[0])} alt={place.name} className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/10" />
        <div className="container-page relative h-full flex flex-col justify-end pb-9">
          <div className="flex items-center gap-2 mb-3">
            <CategoryChip category={place.category} />
            {place.isDramaLocation && <span className="pill border-neon-pink/50 text-neon-pink">{t("explore:placeDetail.dramaLocation")}</span>}
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-2">{place.name}</h1>
          <Link to={`/neighborhoods/${place.neighborhood?.slug}`} className="flex items-center gap-1.5 text-sm text-bone-200/70 hover:text-neon-cyan w-fit">
            <MapPin size={14} /> {place.neighborhood?.name}, {place.city?.name}
          </Link>
          <div className="flex items-center gap-5 mt-4">
            <RatingStars rating={place.rating} size={16} />
            <PriceLevel level={place.priceLevel} />
            <span className="text-sm text-bone-200/50">{t("explore:placeDetail.reviewsCount", { count: place.reviewCount })}</span>
          </div>
        </div>
      </div>

      <div className="container-page py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <p className="text-bone-200/70 leading-relaxed">{place.description}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {place.tags?.map((t) => (
                <span key={t} className="pill capitalize">{t.replace(/-/g, " ")}</span>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading eyebrow={t("explore:placeDetail.reviewsEyebrow")} title={t("explore:placeDetail.reviewsTitle", { count: reviews.length })} />
            {user && (
              <form onSubmit={handleReviewSubmit} className="card-surface p-4 mb-5 space-y-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                      <Star size={20} className={n <= reviewForm.rating ? "fill-neon-cyan text-neon-cyan" : "text-ink-600"} />
                    </button>
                  ))}
                </div>
                <textarea
                  className="input-field resize-none"
                  rows={2}
                  placeholder={t("explore:placeDetail.reviewPlaceholder")}
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                />
                <button type="submit" disabled={submittingReview} className="btn-primary !px-5 !py-2 text-sm">
                  {t("explore:placeDetail.postReview")}
                </button>
              </form>
            )}
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r._id} className="flex gap-3">
                  <Avatar src={r.author?.avatarUrl} name={r.author?.displayName} size={34} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-bone-100">{r.author?.displayName}</p>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="text-xs text-bone-200/40 mb-1">{timeAgo(r.createdAt)}</p>
                    {r.text && <p className="text-sm text-bone-200/80">{r.text}</p>}
                  </div>
                </div>
              ))}
              {!reviews.length && <EmptyState title={t("explore:placeDetail.noReviewsTitle")} description={t("explore:placeDetail.noReviewsDescription")} />}
            </div>
          </section>

          {food?.length > 0 && (
            <section>
              <SectionHeading eyebrow={t("explore:placeDetail.eatNearbyEyebrow")} title={t("explore:placeDetail.foodTitle")} />
              <div className="grid sm:grid-cols-2 gap-3">
                {food.map((f) => (
                  <Link key={f._id} to={`/food/${f.slug}`} className="card-surface p-4 flex items-center gap-3 hover:border-neon-cyan/40">
                    <div>
                      <p className="text-sm font-medium text-bone-100">{f.nameEnglish}</p>
                      <p className="text-xs text-bone-200/50">{f.nameKorean}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {events?.length > 0 && (
            <section>
              <SectionHeading eyebrow={t("explore:placeDetail.happeningHereEyebrow")} title={t("explore:placeDetail.eventsTitle")} />
              <div className="grid sm:grid-cols-2 gap-3">
                {events.map((e) => (
                  <Link key={e._id} to={`/events/${e.slug}`} className="card-surface p-4 hover:border-neon-purple/40">
                    <p className="text-sm font-medium text-bone-100">{e.title}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5">
          <div className="flex gap-2">
            <button onClick={handleSave} className={`btn-ghost flex-1 ${isSaved ? "!border-neon-cyan !text-neon-cyan" : ""}`}>
              <Bookmark size={15} className={isSaved ? "fill-neon-cyan" : ""} /> {isSaved ? t("explore:placeDetail.saved") : t("common:actions.save")}
            </button>
            <button
              onClick={() => (user ? setCollectionModalOpen(true) : navigate("/login"))}
              className="btn-ghost flex-1"
            >
              <FolderPlus size={15} /> {t("explore:placeDetail.collect")}
            </button>
          </div>

          <PlaceMiniMap place={place} />

          {nearby?.length > 0 && (
            <div>
              <p className="text-xs font-semibold tracking-widest text-bone-200/50 uppercase mb-3">{t("explore:placeDetail.nearbyIn", { name: place.neighborhood?.name })}</p>
              <div className="space-y-2">
                {nearby.map((p) => (
                  <Link key={p._id} to={`/places/${p.slug}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-900">
                    {p.images?.[0] && (
                      <img src={resolveImage(p.images[0])} alt={p.name} className="h-12 w-12 rounded-lg object-cover" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm text-bone-100 truncate">{p.name}</p>
                      <RatingStars rating={p.rating} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {user && (
            <button
              onClick={async () => {
                const reason = window.prompt(t("explore:placeDetail.reportPrompt"));
                if (!reason) return;
                const { reportsApi } = await import("../api/social.js");
                await reportsApi.create({ targetType: "Place", targetId: place._id, reason });
                toast(t("explore:placeDetail.reportSubmitted"), "success");
              }}
              className="flex items-center gap-1.5 text-xs text-bone-200/40 hover:text-neon-pink"
            >
              <Flag size={12} /> {t("explore:placeDetail.reportThisPlace")}
            </button>
          )}
        </aside>
      </div>

      {collectionModalOpen && (
        <AddToCollectionModal itemType="Place" itemId={place._id} onClose={() => setCollectionModalOpen(false)} />
      )}
    </div>
  );
}
