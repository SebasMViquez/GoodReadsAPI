import { preferencesStore } from './preferencesStore';

describe('preferencesStore', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists locale, theme, and last login identifier', () => {
    preferencesStore.setLocale('en');
    preferencesStore.setTheme('light');
    preferencesStore.setLastLoginIdentifier('reader@example.com');

    expect(preferencesStore.getLocale()).toBe('en');
    expect(preferencesStore.getTheme()).toBe('light');
    expect(preferencesStore.getLastLoginIdentifier()).toBe('reader@example.com');
  });

  it('clears the remembered identifier without touching other preferences', () => {
    preferencesStore.setLocale('es');
    preferencesStore.setTheme('dark');
    preferencesStore.setLastLoginIdentifier('reader@example.com');

    preferencesStore.clearLastLoginIdentifier();

    expect(preferencesStore.getLocale()).toBe('es');
    expect(preferencesStore.getTheme()).toBe('dark');
    expect(preferencesStore.getLastLoginIdentifier()).toBeNull();
  });
});
