import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { ui } from '@/i18n/ui';
import { preferencesStore } from '@/services/storage/preferencesStore';
import type { Locale } from '@/types';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (value: Record<Locale, string>) => string;
  ui: typeof ui;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const [locale, setLocale] = useState<Locale>(() => {
    return preferencesStore.getLocale() ?? 'es';
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    preferencesStore.setLocale(locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale,
      t: (text) => text[locale],
      ui,
    }),
    [locale],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
};
