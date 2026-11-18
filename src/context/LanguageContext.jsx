import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../data/translations';

const KEY = 'projectile-lab-lang';
const LanguageContext = createContext(null);

function initialLang() {
  try {
    return localStorage.getItem(KEY) === 'en' ? 'en' : 'mr';
  } catch {
    return 'mr';
  }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* storage unavailable */
    }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: translations[lang] }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  return useContext(LanguageContext);
}
