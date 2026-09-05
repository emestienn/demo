import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";
import { notificationsApi } from "../api/social.js";
import { Avatar } from "../components/ui/Bits.jsx";
import { PageLoader } from "../components/ui/Loading.jsx";
import { timeAgo } from "../utils/format.js";
import EmptyState from "../components/ui/EmptyState.jsx";

export default function Notifications() {
  const { t } = useTranslation(["profile", "common"]);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["notifications", "all"], queryFn: () => notificationsApi.list({ limit: 50 }) });

  if (isLoading) return <PageLoader />;

  return (
    <div className="container-page py-12 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-bone-50">{t("common:nav.notifications")}</h1>
        <button
          onClick={async () => {
            await notificationsApi.markAllRead();
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
          }}
          className="text-sm text-neon-cyan"
        >
          {t("profile:notifications.markAllRead")}
        </button>
      </div>

      {data?.data?.length ? (
        <div className="space-y-1.5">
          {data.data.map((n) => (
            <div key={n._id} className={`flex gap-3 p-4 rounded-xl ${n.isRead ? "" : "bg-ink-900"}`}>
              <Avatar src={n.actor?.avatarUrl} name={n.actor?.displayName || "D"} size={36} />
              <div>
                <p className="text-sm text-bone-100">{n.message}</p>
                <p className="text-xs text-bone-200/40 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Bell} title={t("profile:notifications.emptyTitle")} description={t("profile:notifications.emptyDescription")} />
      )}
    </div>
  );
}
