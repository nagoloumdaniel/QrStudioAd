import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./en";
import fr from "./fr";

const DICTS = { en, fr };
const STORAGE_KEY = "qrstudio-lang";
const I18nContext = createContext(null);

function initialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTS[saved]) return saved;
  } catch {
    /* storage unavailable */
  }
  return navigator.language?.toLowerCase().startsWith("fr") ? "fr" : "en";
}

const lookup = (dict, key) => key.split(".").reduce((o, k) => o?.[k], dict);

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = DICTS[lang].meta.title;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* storage unavailable: language still works for this session */
    }
  }, [lang]);

  // t("preview.download", { size: 1024 }) — falls back to English, then to the key.
  const t = useCallback(
    (key, params) => {
      const raw = lookup(DICTS[lang], key) ?? lookup(en, key) ?? key;
      if (typeof raw !== "string" || !params) return raw;
      return raw.replace(/\{(\w+)\}/g, (m, p) => (p in params ? params[p] : m));
    },
    [lang],
  );

  const toggleLang = useCallback(() => setLang((l) => (l === "fr" ? "en" : "fr")), []);
  const value = useMemo(() => ({ lang, setLang, toggleLang, t }), [lang, toggleLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  return useContext(I18nContext);
}
