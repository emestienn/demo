import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Menu, X, ChevronDown, Bookmark, FolderHeart, LogOut, ShieldCheck, LayoutGrid } from "lucide-react";
import { useAuthStore } from "../../stores/authStore.js";
import Logo from "./Logo.jsx";
import NotificationBell from "./NotificationBell.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";
import { Avatar } from "../ui/Bits.jsx";

const NAV_LINKS = [
  { to: "/discover", key: "discover" },
  { to: "/cities", key: "explore" },
  { to: "/map", key: "map" },
  { to: "/food", key: "food" },
  { to: "/culture", key: "culture" },
  { to: "/language", key: "language" },
  { to: "/community", key: "community" },
  { to: "/events", key: "events" },
];

export default function Navbar() {
  const { t } = useTranslation("common");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-ink-800/80 bg-ink-950/80 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1 ml-4">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded-full text-sm font-medium transition ${
                  isActive ? "text-neon-cyan bg-ink-900" : "text-bone-200/70 hover:text-bone-50"
                }`
              }
            >
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <button
            onClick={() => navigate("/search")}
            aria-label={t("nav.search")}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-ink-600 text-bone-100 hover:border-neon-cyan/50 hover:text-neon-cyan transition"
          >
            <Search size={16} />
          </button>

          <LanguageSwitcher />

          {user ? (
            <>
              <NotificationBell />
              <div className="relative" ref={menuRef}>
                <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center gap-1.5">
                  <Avatar src={user.avatarUrl} name={user.displayName} size={34} />
                  <ChevronDown size={14} className="text-bone-200/50 hidden sm:block" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 card-surface shadow-2xl overflow-hidden z-50 animate-fade-up py-1.5">
                    <div className="px-4 py-2 border-b border-ink-700 mb-1">
                      <p className="text-sm font-medium text-bone-50 truncate">{user.displayName}</p>
                      <p className="text-xs text-bone-200/50">{t("levelXp", { level: user.level, xp: user.xp })}</p>
                    </div>
                    <MenuLink to={`/u/${user.username}`} icon={LayoutGrid} label={t("nav.profile")} onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/saved" icon={Bookmark} label={t("nav.savedPlaces")} onClick={() => setMenuOpen(false)} />
                    <MenuLink to="/collections" icon={FolderHeart} label={t("nav.collections")} onClick={() => setMenuOpen(false)} />
                    {(user.role === "admin" || user.role === "moderator") && (
                      <MenuLink to="/admin" icon={ShieldCheck} label={t("nav.adminDashboard")} onClick={() => setMenuOpen(false)} />
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                        navigate("/");
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-neon-pink hover:bg-ink-800/60"
                    >
                      <LogOut size={15} /> {t("nav.logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="btn-ghost !px-4 !py-2">
                {t("nav.login")}
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2">
                {t("nav.register")}
              </Link>
            </div>
          )}

          <button
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full border border-ink-600 text-bone-100"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-ink-800 bg-ink-950 px-5 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? "text-neon-cyan bg-ink-900" : "text-bone-200/70"}`
              }
            >
              {t(`nav.${link.key}`)}
            </NavLink>
          ))}
          {!user && (
            <div className="flex gap-2 pt-3">
              <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost flex-1">
                {t("nav.login")}
              </Link>
              <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function MenuLink({ to, icon: Icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} className="flex items-center gap-2.5 px-4 py-2 text-sm text-bone-100 hover:bg-ink-800/60">
      <Icon size={15} className="text-bone-200/60" /> {label}
    </Link>
  );
}
