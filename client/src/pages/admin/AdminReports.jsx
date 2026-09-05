import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { adminApi } from "../../api/social.js";
import { PageLoader } from "../../components/ui/Loading.jsx";
import { timeAgo } from "../../utils/format.js";
import EmptyState from "../../components/ui/EmptyState.jsx";
import { Flag } from "lucide-react";

const STATUS_COLORS = { open: "text-neon-pink", reviewing: "text-neon-blue", resolved: "text-neon-cyan", dismissed: "text-bone-200/40" };

export default function AdminReports() {
  const { t } = useTranslation("admin");
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-reports"], queryFn: () => adminApi.listReports() });

  async function updateStatus(id, status) {
    await adminApi.updateReportStatus(id, status);
    queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
  }

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <h1 className="font-display text-3xl text-bone-50 mb-6">{t("reports.title")}</h1>
      {data?.length ? (
        <div className="space-y-3">
          {data.map((r) => (
            <div key={r._id} className="card-surface p-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-bone-100">
                  <span className="text-bone-200/50">
                    {t("reports.reportedBy", { targetType: r.targetType, reporter: r.reporter?.displayName })}
                  </span>
                </p>
                <p className="text-sm text-bone-200/70 mt-1">{r.reason}</p>
                <p className="text-xs text-bone-200/40 mt-1">{timeAgo(r.createdAt)}</p>
              </div>
              <select
                value={r.status}
                onChange={(e) => updateStatus(r._id, e.target.value)}
                className={`input-field !w-auto !py-1.5 !text-xs ${STATUS_COLORS[r.status]}`}
              >
                <option value="open">{t("reports.status.open")}</option>
                <option value="reviewing">{t("reports.status.reviewing")}</option>
                <option value="resolved">{t("reports.status.resolved")}</option>
                <option value="dismissed">{t("reports.status.dismissed")}</option>
              </select>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon={Flag} title={t("reports.empty.title")} description={t("reports.empty.description")} />
      )}
    </div>
  );
}
