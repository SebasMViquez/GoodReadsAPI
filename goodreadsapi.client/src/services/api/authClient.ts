import {
  clearCurrentSession,
  createDefaultAuthState,
  createSessionForUser,
  loadPersistedAuthState,
  resolveCurrentUserId,
  savePersistedAuthState,
  type AuthState,
} from '@/services/api/mock/authState';

export interface AuthClient {
  createInitialState: () => AuthState;
  createSession: (state: AuthState, userId: string) => AuthState;
  hydrate: () => Promise<AuthState>;
  persist: (state: AuthState) => Promise<void>;
  resolveCurrentUserId: (state: AuthState) => string | null;
  clearSession: (state: AuthState) => AuthState;
}

export const authClient: AuthClient = {
  createInitialState: createDefaultAuthState,
  createSession: createSessionForUser,
  async hydrate() {
    return loadPersistedAuthState();
  },
  async persist(state) {
    savePersistedAuthState(state);
  },
  resolveCurrentUserId,
  clearSession: clearCurrentSession,
};
