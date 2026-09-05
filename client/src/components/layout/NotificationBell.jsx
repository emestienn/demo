import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { notificationsApi } from "../../api/social.js";
import { Avatar } from "../ui/Bits.jsx";
import { timeAgo } from "../../utils/format.js";

export default function NotificationBell() {
  const { t } = useTranslation(["profile", "common"]);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications", "preview"],
    queryFn: () => notificationsApi.list({ limit: 8 }),
    refetchInterval: 30000,
  });

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unreadCount = data?.meta?.unreadCount || 0;

  async function handleOpen() {
    setOpen((v) => !v);
    if (unreadCount > 0) {
      await notificationsApi.markAllRead();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        aria-label={t("profile:notifications.ariaLabel")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-ink-600 text-bone-100 hover:border-neon-cyan/50 hover:text-neon-cyan transition"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-neon-pink text-[10px] font-semibold text-ink-950">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card-surface shadow-2xl overflow-hidden z-50 animate-fade-up">
          <div className="px-4 py-3 border-b border-ink-700 flex items-center justify-between">
            <p className="font-display text-sm">{t("profile:notifications.panelTitle")}</p>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-ink-800">
            {!data?.data?.length && <p className="px-4 py-6 text-sm text-bone-200/50 text-center">{t("profile:notifications.allCaughtUp")}</p>}
            {data?.data?.map((n) => (
              <div key={n._id} className="px-4 py-3 flex gap-3 hover:bg-ink-800/60">
                <Avatar src={n.actor?.avatarUrl} name={n.actor?.displayName || "D"} size={30} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-bone-100 leading-snug">{n.message}</p>
                  <p className="text-[11px] text-bone-200/40 mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block text-center py-2.5 text-xs font-medium text-neon-cyan hover:bg-ink-800/60 border-t border-ink-700"
          >
            {t("profile:notifications.viewAll")}
          </Link>
        </div>
      )}
    </div>
  );
}
