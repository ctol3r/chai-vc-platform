import { useState } from 'react';
import { t, Locale } from '../i18n';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');

  return (
    <div>
      <select value={locale} onChange={e => setLocale(e.target.value as Locale)}>
        <option value="en">English</option>
        <option value="es">Espa\u00f1ol</option>
      </select>
      <h1>{t('welcome', locale)}</h1>
    </div>
  );
}
