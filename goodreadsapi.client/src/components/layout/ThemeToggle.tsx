import { MoonStar, SunMedium } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t, ui } = useLanguage();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={t({ en: 'Toggle theme', es: 'Cambiar tema' })}
    >
      {theme === 'dark' ? <SunMedium size={16} /> : <MoonStar size={16} />}
      <span>{theme === 'dark' ? t(ui.common.light) : t(ui.common.dark)}</span>
    </button>
  );
}
