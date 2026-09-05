import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CalendarDays, MapPin, Bookmark } from "lucide-react";
import { eventsApi } from "../api/content.js";
import { useAuthStore } from "../stores/authStore.js";
import { PageLoader } from "../components/ui/Loading.jsx";
import { resolveImage, getApiErrorMessage } from "../api/client.js";
import { formatDateTime } from "../utils/format.js";
import { toast } from "../stores/toastStore.js";

const EVENT_TYPE_KEYS = {
  "pop-up": "popUp",
};

export default function EventDetail() {
  const { t } = useTranslation(["events", "common"]);
  const { slug } = useParams();
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useQuery({ queryKey: ["event", slug], queryFn: () => eventsApi.get(slug) });

  if (isLoading) return <PageLoader />;
  if (!event) return null;

  async function handleSave() {
    if (!user) return navigate("/login");
    try {
      const res = await eventsApi.toggleSave(event._id);
      queryClient.invalidateQueries({ queryKey: ["event", slug] });
      toast(res.saved ? t("events:toast.saved") : t("events:toast.removed"), "success");
    } catch (err) {
      toast(getApiErrorMessage(err), "error");
    }
  }

  return (
    <div>
      <div className="relative h-[46vh] min-h-[320px] overflow-hidden border-b border-ink-800">
        {event.images?.[0] && <img src={resolveImage(event.images[0])} alt={event.title} className="absolute inset-0 h-full w-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/55 to-ink-950/10" />
        <div className="container-page relative h-full flex flex-col justify-end pb-9">
          <p className="text-xs uppercase tracking-widest text-neon-purple mb-2">{t(`events:types.${EVENT_TYPE_KEYS[event.type] || event.type}`)}</p>
          <h1 className="font-display text-4xl sm:text-5xl text-bone-50 max-w-2xl mb-3">{event.title}</h1>
          <div className="flex flex-wrap gap-5 text-sm text-bone-200/70">
            <span className="flex items-center gap-1.5"><CalendarDays size={14} /> {formatDateTime(event.startDate)}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.venueName}, {event.city?.name}</span>
          </div>
        </div>
      </div>

      <div className="container-page py-12 max-w-3xl space-y-6">
        <p className="text-bone-200/70 leading-relaxed">{event.description}</p>
        <div className="flex items-center gap-4">
          <span className="pill">{event.priceRange}</span>
          {event.neighborhood && (
            <Link to={`/neighborhoods/${event.neighborhood.slug}`} className="pill hover:border-neon-cyan/50 hover:text-neon-cyan">
              {event.neighborhood.name}
            </Link>
          )}
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Bookmark size={15} /> {t("events:detail.saveEvent")}
        </button>
      </div>
    </div>
  );
}
