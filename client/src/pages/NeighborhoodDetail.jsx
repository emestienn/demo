import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CalendarDays } from "lucide-react";
import { neighborhoodsApi } from "../api/content.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { PlaceCard, SectionHeading, RatingStars, Avatar } from "../components/ui/Bits.jsx";
import { formatDate, timeAgo } from "../utils/format.js";

export default function NeighborhoodDetail() {
  const { t } = useTranslation("explore");
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ["neighborhood", slug], queryFn: () => neighborhoodsApi.get(slug) });

  if (isLoading) return <PageLoader />;
  if (!data) return null;
  const { neighborhood: n, places, events, posts } = data;

  return (
    <div>
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden border-b border-ink-800">
        <img src={n.heroImage} alt={n.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-ink-950/10" />
        <div className="container-page relative h-full flex flex-col justify-end pb-9">
          <Link to={`/cities/${n.city?.slug}`} className="text-xs uppercase tracking-widest text-neon-cyan mb-2 w-fit hover:underline">
            {n.city?.name}
          </Link>
          <h1 className="font-display text-5xl text-bone-50 mb-2">{n.name}</h1>
          <p className="text-bone-200/70 max-w-xl">{n.tagline}</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {n.vibeTags?.map((t) => (
              <span key={t} className="pill capitalize">{t.replace(/-/g, " ")}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="container-page py-14 space-y-14">
        <section className="grid lg:grid-cols-3 gap-8">
          <p className="lg:col-span-2 text-bone-200/70 leading-relaxed">{n.description}</p>
          <div className="card-surface p-5 space-y-3 h-fit">
            <InfoRow label={t("neighborhoodDetail.info.atmosphere")} value={n.atmosphere} />
            <InfoRow label={t("neighborhoodDetail.info.avgPrice")} value={"₩".repeat(n.avgPriceLevel)} />
            <InfoRow label={t("neighborhoodDetail.info.bestTime")} value={n.bestTimeToVisit} />
            <InfoRow label={t("neighborhoodDetail.info.rating")} value={<RatingStars rating={n.rating} />} />
          </div>
        </section>

        {n.popularActivities?.length > 0 && (
          <section>
            <SectionHeading eyebrow={t("neighborhoodDetail.whatToDoEyebrow")} title={t("neighborhoodDetail.popularActivitiesTitle")} />
            <div className="flex flex-wrap gap-2">
              {n.popularActivities.map((a) => (
                <span key={a} className="pill">{a}</span>
              ))}
            </div>
          </section>
        )}

        {places?.length > 0 && (
          <section>
            <SectionHeading eyebrow={t("neighborhoodDetail.spotsEyebrow", { count: places.length })} title={t("neighborhoodDetail.placesTitle")} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {places.map((p) => (
                <PlaceCard key={p._id} place={{ ...p, neighborhood: n }} />
              ))}
            </div>
          </section>
        )}

        {events?.length > 0 && (
          <section>
            <SectionHeading eyebrow={t("neighborhoodDetail.comingUpEyebrow")} title={t("neighborhoodDetail.eventsTitle")} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((e) => (
                <Link key={e._id} to={`/events/${e.slug}`} className="card-surface p-5 hover:border-neon-purple/40 transition">
                  <p className="text-xs text-neon-purple font-semibold flex items-center gap-1.5 mb-2">
                    <CalendarDays size={12} /> {formatDate(e.startDate)}
                  </p>
                  <h3 className="font-display text-base text-bone-50 line-clamp-1">{e.title}</h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {posts?.length > 0 && (
          <section>
            <SectionHeading eyebrow={t("neighborhoodDetail.localVoicesEyebrow")} title={t("neighborhoodDetail.communityTitle")} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post._id} className="card-surface p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Avatar src={post.author?.avatarUrl} name={post.author?.displayName} size={28} />
                    <div>
                      <p className="text-sm font-medium text-bone-100">{post.author?.displayName}</p>
                      <p className="text-xs text-bone-200/40">{timeAgo(post.createdAt)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-bone-200/80 line-clamp-3">{post.text}</p>
                </div>
              ))}
            </div>
          </section>
        )}
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
