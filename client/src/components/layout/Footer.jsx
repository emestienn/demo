import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "./Logo.jsx";

export default function Footer() {
  const { t } = useTranslation("common");
  return (
    <footer className="border-t border-ink-800 mt-24">
      <div className="container-page py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <Logo />
          <p className="mt-3 text-sm text-bone-200/50 max-w-[220px]">
            {t("footer.tagline")}
          </p>
        </div>
        <FooterColumn
          title={t("footer.exploreTitle")}
          links={[[t("nav.discover"), "/discover"], [t("footer.cities"), "/cities"], [t("nav.map"), "/map"], [t("nav.events"), "/events"]]}
        />
        <FooterColumn
          title={t("footer.cultureTitle")}
          links={[[t("nav.food"), "/food"], [t("footer.kCulture"), "/culture"], [t("nav.language"), "/language"]]}
        />
        <FooterColumn
          title={t("footer.communityTitle")}
          links={[[t("footer.feed"), "/community"], [t("nav.search"), "/search"]]}
        />
      </div>
      <div className="container-page py-6 border-t border-ink-800 text-xs text-bone-200/40 flex justify-between">
        <span>© {new Date().getFullYear()} DONGNE</span>
        <span>{t("footer.builtFor")}</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wider text-bone-200/40 uppercase mb-3">{title}</p>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-bone-200/70 hover:text-neon-cyan transition">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
