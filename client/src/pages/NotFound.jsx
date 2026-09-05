import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation("common");
  return (
    <div className="container-page py-32 text-center">
      <p className="font-display text-8xl text-neon-cyan/30 mb-4">404</p>
      <h1 className="font-display text-2xl text-bone-50 mb-2">{t("notFound.title")}</h1>
      <p className="text-bone-200/60 mb-8">{t("notFound.description")}</p>
      <Link to="/discover" className="btn-primary">
        {t("notFound.cta")}
      </Link>
    </div>
  );
}
