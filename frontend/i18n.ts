import en from './locales/en.json';
import es from './locales/es.json';

export type Locale = 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = { en, es };

export function t(key: string, locale: Locale = 'en'): string {
  const langPack = translations[locale] || translations.en;
  return langPack[key] || translations.en[key] || key;
}
