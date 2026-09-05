import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const modules = import.meta.glob("./locales/*/*.json", { eager: true });

const resources = {};
for (const path in modules) {
  const match = path.match(/\.\/locales\/([^/]+)\/([^/]+)\.json$/);
  if (!match) continue;
  const [, lang, namespace] = match;
  resources[lang] ??= {};
  resources[lang][namespace] = modules[path].default;
}

const STORAGE_KEY = "dongne-language";

function getSavedLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function changeLanguage(lang) {
  i18n.changeLanguage(lang);
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore storage failures (private browsing, etc.)
  }
}

i18n.use(initReactI18next).init({
  resources,
  lng: getSavedLanguage() || "en",
  fallbackLng: "en",
  ns: Object.keys(resources.en || {}),
  defaultNS: "common",
  interpolation: { escapeValue: false },
});

export default i18n;
