import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { readSetting, StorageKeys, writeSetting } from '@/lib/storage';

import { deviceLocale, i18n, isLocale, type Locale } from './index';

type TranslateOptions = Record<string, string | number>;

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: TranslateOptions) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function initialLocale(): Locale {
  const saved = readSetting(StorageKeys.locale);
  return isLocale(saved) ? saved : deviceLocale();
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const value = initialLocale();
    i18n.locale = value;
    return value;
  });

  const setLocale = useCallback((next: Locale) => {
    i18n.locale = next;
    setLocaleState(next);
    void writeSetting(StorageKeys.locale, next);
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      // `locale` is referenced so consumers re-render when it changes.
      t: (key, options) => i18n.t(key, { ...options, locale }),
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return context;
}
