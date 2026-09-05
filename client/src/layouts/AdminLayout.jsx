import { NavLink, Outlet, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, MapPinned, Building2, UtensilsCrossed, Sparkles, CalendarDays, Flag, ArrowLeft } from "lucide-react";

const LINKS = [
  { to: "/admin", labelKey: "overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", labelKey: "users", icon: Users },
  { to: "/admin/places", labelKey: "places", icon: MapPinned },
  { to: "/admin/cities", labelKey: "cities", icon: Building2 },
  { to: "/admin/food", labelKey: "food", icon: UtensilsCrossed },
  { to: "/admin/culture", labelKey: "culture", icon: Sparkles },
  { to: "/admin/events", labelKey: "events", icon: CalendarDays },
  { to: "/admin/reports", labelKey: "reports", icon: Flag },
];

export default function AdminLayout() {
  const { t } = useTranslation("admin");
  return (
    <div className="min-h-screen flex bg-ink-950">
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-ink-800 p-5">
        <Link to="/" className="flex items-center gap-2 text-sm text-bone-200/60 hover:text-neon-cyan mb-8">
          <ArrowLeft size={14} /> {t("layout.backToDongne")}
        </Link>
        <p className="text-xs font-semibold tracking-[0.2em] text-neon-purple uppercase mb-4 px-2">{t("layout.adminConsole")}</p>
        <nav className="space-y-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive ? "bg-ink-900 text-neon-purple border border-neon-purple/30" : "text-bone-200/70 hover:bg-ink-900"
                }`
              }
            >
              <link.icon size={16} /> {t(`layout.nav.${link.labelKey}`)}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 sm:p-10 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
