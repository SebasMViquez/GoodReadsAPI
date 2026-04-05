const getStorage = () => {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

export const browserStorage = {
  getString(key: string) {
    return getStorage()?.getItem(key) ?? null;
  },

  setString(key: string, value: string) {
    getStorage()?.setItem(key, value);
  },

  remove(key: string) {
    getStorage()?.removeItem(key);
  },

  getJSON<T>(key: string): T | null {
    const raw = this.getString(key);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setJSON<T>(key: string, value: T) {
    this.setString(key, JSON.stringify(value));
  },
};
