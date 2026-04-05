import {
  createDefaultStateForUser,
  emptyLibraryState,
  loadPersistedLibraryState,
  savePersistedLibraryState,
  type UserLibraryState,
} from '@/services/api/mock/libraryState';
import type { User } from '@/types';

export interface LibraryClient {
  createDefaultStateForUser: (user: User) => UserLibraryState;
  emptyLibraryState: UserLibraryState;
  hydrate: () => Promise<Record<string, UserLibraryState>>;
  persist: (state: Record<string, UserLibraryState>) => Promise<void>;
}

export const libraryClient: LibraryClient = {
  createDefaultStateForUser,
  emptyLibraryState,
  async hydrate() {
    return loadPersistedLibraryState();
  },
  async persist(state) {
    savePersistedLibraryState(state);
  },
};
