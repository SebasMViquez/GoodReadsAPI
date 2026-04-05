import { browserStorage } from '@/services/storage/browserStorage';

const sessionTokenKey = 'goodreads-session-token';

export const sessionStore = {
  getToken() {
    return browserStorage.getString(sessionTokenKey);
  },

  setToken(token: string) {
    browserStorage.setString(sessionTokenKey, token);
  },

  clear() {
    browserStorage.remove(sessionTokenKey);
  },
};
