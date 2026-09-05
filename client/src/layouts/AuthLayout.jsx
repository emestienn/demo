import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "../components/layout/Logo.jsx";

export default function AuthLayout() {
  const { t } = useTranslation("auth");
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-ink-950">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-grid-fade border-r border-ink-800 relative overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-neon-purple/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-neon-cyan/10 blur-3xl" />
        <Logo />
        <div className="relative z-10">
          <p className="text-xs tracking-[0.3em] text-neon-cyan uppercase mb-4">{t("layout.eyebrow")}</p>
          <h1 className="font-display text-5xl leading-[1.05] text-bone-50 max-w-md">
            {t("layout.heading")}
          </h1>
        </div>
        <p className="text-sm text-bone-200/40 relative z-10">{t("layout.tagline")}</p>
      </div>
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex justify-center">
            <Logo />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
