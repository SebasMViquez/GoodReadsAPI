import type { AppSettings, Locale, ThemeMode } from '@/types';
import { browserStorage } from './browserStorage';

const keys = {
  locale: 'goodreads-language',
  theme: 'goodreads-theme',
  lastLoginIdentifier: 'goodreads:last-login-identifier',
  appSettings: 'goodreads:app-settings',
} as const;

export const defaultAppSettings: AppSettings = {
  privacy: {
    messageAccess: 'everyone',
    showReadingActivity: true,
    showFavorites: true,
    showFollowers: true,
  },
  notifications: {
    likes: true,
    follows: true,
    comments: true,
    messages: true,
    emailNotifications: false,
    pushNotifications: true,
  },
  appearance: {
    density: 'comfortable',
    reduceMotion: false,
  },
  language: {
    contentLocale: 'en',
  },
  reading: {
    yearlyGoal: 24,
    preferredFormat: 'Any',
    favoriteGenres: ['Literary Fiction', 'Fantasy', 'Science Fiction'],
    showReadingProgress: true,
  },
  security: {
    twoFactorEnabled: false,
    sessionAlerts: true,
  },
};

const mergeAppSettings = (storedSettings: Partial<AppSettings> | null): AppSettings => ({
  privacy: {
    ...defaultAppSettings.privacy,
    ...(storedSettings?.privacy ?? {}),
  },
  notifications: {
    ...defaultAppSettings.notifications,
    ...(storedSettings?.notifications ?? {}),
  },
  appearance: {
    ...defaultAppSettings.appearance,
    ...(storedSettings?.appearance ?? {}),
  },
  language: {
    ...defaultAppSettings.language,
    ...(storedSettings?.language ?? {}),
  },
  reading: {
    ...defaultAppSettings.reading,
    ...(storedSettings?.reading ?? {}),
    favoriteGenres:
      storedSettings?.reading?.favoriteGenres ?? defaultAppSettings.reading.favoriteGenres,
  },
  security: {
    ...defaultAppSettings.security,
    ...(storedSettings?.security ?? {}),
  },
});

export const preferencesStore = {
  getLocale() {
    return browserStorage.getString(keys.locale) as Locale | null;
  },

  setLocale(locale: Locale) {
    browserStorage.setString(keys.locale, locale);
  },

  getTheme() {
    return browserStorage.getString(keys.theme) as ThemeMode | null;
  },

  setTheme(theme: ThemeMode) {
    browserStorage.setString(keys.theme, theme);
  },

  getLastLoginIdentifier() {
    return browserStorage.getString(keys.lastLoginIdentifier);
  },

  setLastLoginIdentifier(identifier: string) {
    browserStorage.setString(keys.lastLoginIdentifier, identifier);
  },

  clearLastLoginIdentifier() {
    browserStorage.remove(keys.lastLoginIdentifier);
  },

  getAppSettings() {
    return mergeAppSettings(browserStorage.getJSON<Partial<AppSettings>>(keys.appSettings));
  },

  setAppSettings(appSettings: AppSettings) {
    browserStorage.setJSON(keys.appSettings, appSettings);
  },
};
