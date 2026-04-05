import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from 'react';
import { preferencesStore } from '@/services/storage/preferencesStore';
import type { ThemeMode } from '@/types';

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return preferencesStore.getTheme() ?? 'dark';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    preferencesStore.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return context;
};
