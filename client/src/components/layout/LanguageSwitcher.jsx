import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { changeLanguage } from "../../i18n/index.js";

const LANGUAGES = ["en", "ru", "ko", "uz"];

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language.select")}
        className="flex h-9 items-center gap-1.5 px-2.5 rounded-full border border-ink-600 text-bone-100 hover:border-neon-cyan/50 hover:text-neon-cyan transition text-xs font-medium uppercase"
      >
        <Languages size={15} /> {i18n.language}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 card-surface shadow-2xl overflow-hidden z-50 animate-fade-up py-1.5">
          {LANGUAGES.map((code) => (
            <button
              key={code}
              onClick={() => {
                changeLanguage(code);
                setOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-ink-800/60 ${
                i18n.language === code ? "text-neon-cyan" : "text-bone-100"
              }`}
            >
              {t(`language.${code}`)}
              <span className="text-xs uppercase text-bone-200/40">{code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
