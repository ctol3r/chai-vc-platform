import en from './en.json';
import es from './es.json';

export type Locale = 'en' | 'es';

const translations: Record<Locale, Record<string, string>> = {
  en,
  es,
};

export function t(key: string, locale: Locale = 'en'): string {
  const dict = translations[locale] || translations.en;
  return dict[key] || key;
}
