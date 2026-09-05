import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Flame, Gem, MapPin, Sparkles, Users2, Languages, Clock3 } from "lucide-react";
import { recommendationsApi } from "../api/content.js";
import { useAuthStore } from "../stores/authStore.js";
import { PlaceCard, RatingStars, Avatar, SectionHeading } from "../components/ui/Bits.jsx";
import { PageLoader } from "../components/ui/Loading.jsx";
import { resolveImage } from "../api/client.js";
import { formatDate, timeAgo } from "../utils/format.js";

function HScroll({ children }) {
  return <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x">{children}</div>;
}

export default function Discover() {
  const { t } = useTranslation(["discover", "common"]);
  const user = useAuthStore((s) => s.user);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { timeout: 4000 },
    );
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["discover", coords],
    queryFn: () => recommendationsApi.discover(coords || {}),
  });

  if (isLoading || !data) return <PageLoader />;

  const hero = data.forYou?.[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t("greeting.morning") : hour < 18 ? t("greeting.afternoon") : t("greeting.evening");

  return (
    <div className="container-page py-10 space-y-16">
      <section>
        <p className="text-xs tracking-[0.3em] uppercase text-neon-cyan mb-2">{greeting.toUpperCase()}</p>
        <h1 className="font-display text-4xl sm:text-5xl text-bone-50 mb-8">
          {t("heroTitle", { name: user ? `, ${user.displayName}` : "" })}
        </h1>

        {hero && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link
              to={`/places/${hero.place.slug}`}
              className="group relative flex flex-col sm:flex-row gap-6 sm:gap-10 rounded-3xl border border-ink-700 overflow-hidden bg-ink-900 hover:border-neon-cyan/40 transition"
            >
              <div className="relative sm:w-1/2 aspect-[16/10] sm:aspect-auto overflow-hidden">
                {hero.place.images?.[0] && (
                  <img
                    src={resolveImage(hero.place.images[0])}
                    alt={hero.place.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 sm:bg-gradient-to-r sm:from-transparent sm:to-ink-900" />
              </div>
              <div className="flex-1 flex flex-col justify-center p-6 sm:p-0 sm:pr-10">
                {hero.matchScore && (
                  <p className="text-sm font-semibold text-neon-cyan mb-2">{t("common:matchPercent", { score: hero.matchScore })}</p>
                )}
                <h2 className="font-display text-3xl sm:text-4xl text-bone-50 mb-3">{t("hero.exploreNeighborhood", { neighborhood: hero.place.neighborhood?.name })}</h2>
                <p className="text-bone-200/60 max-w-md mb-4 line-clamp-2">{hero.place.description}</p>
                <div className="flex items-center gap-4">
                  <RatingStars rating={hero.place.rating} />
                  <span className="text-sm text-bone-200/50 capitalize">{hero.place.category}</span>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-bone-50">
                  {t("hero.seeSpot")} <ArrowUpRight size={15} />
                </span>
              </div>
            </Link>
          </motion.div>
        )}
      </section>

      {data.trending?.length > 0 && (
        <Section icon={Flame} eyebrow={t("sections.trending.eyebrow")} title={t("sections.trending.title")} to="/map">
          <HScroll>
            {data.trending.map((place) => (
              <div key={place._id} className="w-64 shrink-0 snap-start">
                <PlaceCard place={place} />
              </div>
            ))}
          </HScroll>
        </Section>
      )}

      {data.forYou?.length > 1 && (
        <Section icon={Sparkles} eyebrow={t("sections.forYou.eyebrow")} title={t("sections.forYou.title")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.forYou.slice(1).map(({ place, matchScore }) => (
              <PlaceCard key={place._id} place={place} matchScore={matchScore} />
            ))}
          </div>
        </Section>
      )}

      {data.hiddenGems?.length > 0 && (
        <Section icon={Gem} eyebrow={t("sections.hiddenGems.eyebrow")} title={t("sections.hiddenGems.title")}>
          <HScroll>
            {data.hiddenGems.map((place) => (
              <div key={place._id} className="w-64 shrink-0 snap-start">
                <PlaceCard place={place} />
              </div>
            ))}
          </HScroll>
        </Section>
      )}

      {data.nearby?.length > 0 && (
        <Section icon={MapPin} eyebrow={t("sections.nearby.eyebrow")} title={t("sections.nearby.title")}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.nearby.map((place) => (
              <PlaceCard key={place._id} place={place} />
            ))}
          </div>
        </Section>
      )}

      {data.upcomingEvents?.length > 0 && (
        <Section icon={Clock3} eyebrow={t("sections.upcomingEvents.eyebrow")} title={t("sections.upcomingEvents.title")} to="/events">
          <HScroll>
            {data.upcomingEvents.map((event) => (
              <Link
                key={event._id}
                to={`/events/${event.slug}`}
                className="w-72 shrink-0 snap-start card-surface p-5 hover:border-neon-purple/40 transition"
              >
                <p className="text-xs text-neon-purple font-semibold mb-2">{formatDate(event.startDate)}</p>
                <h3 className="font-display text-lg text-bone-50 mb-1 line-clamp-1">{event.title}</h3>
                <p className="text-sm text-bone-200/50">{event.city?.name} · {event.venueName}</p>
              </Link>
            ))}
          </HScroll>
        </Section>
      )}

      {data.communityPicks?.length > 0 && (
        <Section icon={Users2} eyebrow={t("sections.communityPicks.eyebrow")} title={t("sections.communityPicks.title")} to="/community">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.communityPicks.map((post) => (
              <div key={post._id} className="card-surface p-5">
                <div className="flex items-center gap-2.5 mb-3">
                  <Avatar src={post.author?.avatarUrl} name={post.author?.displayName} size={30} />
                  <div>
                    <p className="text-sm font-medium text-bone-100">{post.author?.displayName}</p>
                    <p className="text-xs text-bone-200/40">{timeAgo(post.createdAt)}</p>
                  </div>
                </div>
                <p className="text-sm text-bone-200/80 line-clamp-3">{post.text}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.dailyChallenge && (
        <Section icon={Languages} eyebrow={t("sections.dailyChallenge.eyebrow")} title={t("sections.dailyChallenge.title")}>
          <Link
            to={`/language/${data.dailyChallenge.slug}`}
            className="card-surface flex items-center justify-between p-6 hover:border-neon-cyan/40 transition"
          >
            <div>
              <p className="text-xs text-neon-cyan font-semibold mb-1">{t("sections.dailyChallenge.todaysLesson")}</p>
              <h3 className="font-display text-xl text-bone-50">{data.dailyChallenge.title}</h3>
            </div>
            <span className="btn-primary">{t("sections.dailyChallenge.startLesson")}</span>
          </Link>
        </Section>
      )}
    </div>
  );
}

function Section({ icon: Icon, eyebrow, title, to, children }) {
  const { t } = useTranslation("common");
  return (
    <section>
      <SectionHeading
        eyebrow={eyebrow}
        title={
          <span className="flex items-center gap-2.5">
            <Icon size={22} className="text-neon-cyan" /> {title}
          </span>
        }
        action={
          to && (
            <Link to={to} className="text-sm text-bone-200/60 hover:text-neon-cyan flex items-center gap-1 shrink-0">
              {t("actions.seeAll")} <ArrowUpRight size={13} />
            </Link>
          )
        }
      />
      {children}
    </section>
  );
}
