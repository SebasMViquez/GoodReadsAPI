import { Languages } from 'lucide-react';
import type { Locale } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

const locales: Locale[] = ['es', 'en'];

export function LanguageToggle() {
  const { locale, setLocale, t, ui } = useLanguage();

  return (
    <div className="language-toggle" aria-label={t(ui.common.language)}>
      <span className="language-toggle__icon" aria-hidden="true">
        <Languages size={12} />
      </span>
      {locales.map((value) => (
        <button
          key={value}
          type="button"
          className={
            locale === value
              ? 'language-toggle__item language-toggle__item--active'
              : 'language-toggle__item'
          }
          onClick={() => setLocale(value)}
          aria-label={value === 'es' ? t(ui.common.spanish) : t(ui.common.english)}
          title={value === 'es' ? t(ui.common.spanish) : t(ui.common.english)}
        >
          {value.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
