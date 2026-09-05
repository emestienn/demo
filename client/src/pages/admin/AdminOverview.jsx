import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Users, MapPinned, MessageSquare, CalendarDays, Star, Flag } from "lucide-react";
import { adminApi } from "../../api/social.js";
import { PageLoader } from "../../components/ui/Loading.jsx";

const CHART_COLORS = ["#5ef2ff", "#5b8cff", "#b083ff", "#ff5fa8", "#f5f4f0"];

export default function AdminOverview() {
  const { t } = useTranslation("admin");
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: adminApi.getStats });

  if (isLoading) return <PageLoader />;
  if (!data) return null;

  const { totals, activityByDay, topCategories, topPlaces, usersByRole } = data;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs tracking-[0.3em] uppercase text-neon-purple mb-2">{t("layout.adminConsole")}</p>
        <h1 className="font-display text-3xl text-bone-50">{t("overview.title")}</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label={t("overview.stats.users")} value={totals.userCount} sub={t("overview.stats.usersSub", { count: totals.newUsers30 })} />
        <StatCard icon={MapPinned} label={t("overview.stats.places")} value={totals.placeCount} />
        <StatCard icon={MessageSquare} label={t("overview.stats.posts")} value={totals.postCount} />
        <StatCard icon={CalendarDays} label={t("overview.stats.events")} value={totals.eventCount} />
        <StatCard icon={Star} label={t("overview.stats.reviews")} value={totals.reviewCount} />
        <StatCard icon={Flag} label={t("overview.stats.openReports")} value={totals.openReports} accent={totals.openReports > 0} />
        <StatCard label={t("overview.stats.engagement")} value={totals.engagementLast7} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <p className="text-sm font-medium text-bone-100 mb-4">{t("overview.activityChart")}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityByDay}>
              <XAxis dataKey="_id" tick={{ fontSize: 10, fill: "#8a8a92" }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: "#8a8a92" }} />
              <Tooltip contentStyle={{ background: "#18181c", border: "1px solid #2e2e35", borderRadius: 8 }} />
              <Bar dataKey="count" fill="#5ef2ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-surface p-5">
          <p className="text-sm font-medium text-bone-100 mb-4">{t("overview.categoryChart")}</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={topCategories} dataKey="count" nameKey="_id" innerRadius={50} outerRadius={80}>
                {topCategories.map((entry, i) => (
                  <Cell key={entry._id} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#18181c", border: "1px solid #2e2e35", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card-surface p-5">
          <p className="text-sm font-medium text-bone-100 mb-4">{t("overview.mostViewedPlaces")}</p>
          <div className="space-y-2">
            {topPlaces.map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <span className="text-bone-200/80">{p.name}</span>
                <span className="text-bone-200/40">{t("overview.viewsCount", { count: p.viewCount })}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-surface p-5">
          <p className="text-sm font-medium text-bone-100 mb-4">{t("overview.usersByRole")}</p>
          <div className="space-y-2">
            {usersByRole.map((r) => (
              <div key={r._id} className="flex items-center justify-between text-sm">
                <span className="text-bone-200/80 capitalize">{t(`users.roles.${r._id}`, r._id)}</span>
                <span className="text-bone-200/40">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="card-surface p-5">
      {Icon && <Icon size={18} className={accent ? "text-neon-pink mb-3" : "text-neon-purple mb-3"} />}
      <p className="font-display text-2xl text-bone-50">{value}</p>
      <p className="text-xs text-bone-200/50">{label}</p>
      {sub && <p className="text-xs text-neon-cyan mt-1">{sub}</p>}
    </div>
  );
}
