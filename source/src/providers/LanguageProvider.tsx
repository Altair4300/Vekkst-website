import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Language } from "@/lib/translations";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      return (localStorage.getItem("vekkst_language") as Language) || "en";
    } catch {
      return "en";
    }
  });

  const setLang = (newLang: Language) => {
    try {
      localStorage.setItem("vekkst_language", newLang);
    } catch {
      // ignore localStorage errors
    }
    setLangState(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
