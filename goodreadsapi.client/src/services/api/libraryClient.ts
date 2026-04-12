import {
  createDefaultStateForUser,
  emptyLibraryState,
  loadPersistedLibraryState,
  savePersistedLibraryState,
  type UserLibraryState,
} from '@/services/api/mock/libraryState';
import { buildApiUrl, isBackendApiEnabled } from '@/services/api/http';
import type { ShelfStatus, User } from '@/types';

export interface LibraryClient {
  createDefaultStateForUser: (user: User) => UserLibraryState;
  emptyLibraryState: UserLibraryState;
  hydrate: () => Promise<Record<string, UserLibraryState>>;
  persist: (state: Record<string, UserLibraryState>) => Promise<void>;
  isBackendEnabled: () => boolean;
  fetchForUser: (userId: string) => Promise<UserLibraryState>;
  setShelf: (userId: string, bookId: string, shelf: ShelfStatus) => Promise<UserLibraryState>;
  setFavorite: (userId: string, bookId: string, isFavorite: boolean) => Promise<UserLibraryState>;
  updateProgress: (userId: string, bookId: string, progress: number) => Promise<UserLibraryState>;
}

interface RemoteLibraryStateResponse {
  shelves: Partial<Record<ShelfStatus, string[]>>;
  favorites: string[];
  progressMap: Record<string, number>;
}

const createHeaders = (userId: string, hasBody = false): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-User-Id': userId,
  };

  if (hasBody) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const normalizeRemoteLibraryState = (payload: RemoteLibraryStateResponse): UserLibraryState => ({
  shelves: {
    'want-to-read': payload.shelves['want-to-read'] ?? [],
    'currently-reading': payload.shelves['currently-reading'] ?? [],
    read: payload.shelves.read ?? [],
  },
  favorites: payload.favorites ?? [],
  progressMap: payload.progressMap ?? {},
});

const fetchRemoteLibrary = async (userId: string): Promise<UserLibraryState> => {
  const response = await fetch(buildApiUrl('/api/me/library'), {
    headers: createHeaders(userId),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user library (${response.status}).`);
  }

  const payload = (await response.json()) as RemoteLibraryStateResponse;
  return normalizeRemoteLibraryState(payload);
};

const mutateLibraryAndReload = async (
  userId: string,
  path: string,
  body: object,
): Promise<UserLibraryState> => {
  const response = await fetch(buildApiUrl(path), {
    method: 'PUT',
    headers: createHeaders(userId, true),
    body: JSON.stringify(body),
  });

  if (!response.ok && response.status !== 204) {
    throw new Error(`Failed library mutation (${response.status}) on ${path}.`);
  }

  return fetchRemoteLibrary(userId);
};

export const libraryClient: LibraryClient = {
  createDefaultStateForUser,
  emptyLibraryState,
  async hydrate() {
    return loadPersistedLibraryState();
  },
  async persist(state) {
    savePersistedLibraryState(state);
  },
  isBackendEnabled: isBackendApiEnabled,
  fetchForUser: fetchRemoteLibrary,
  setShelf(userId, bookId, shelf) {
    return mutateLibraryAndReload(userId, `/api/me/library/books/${encodeURIComponent(bookId)}/shelf`, {
      shelfStatus: shelf,
    });
  },
  setFavorite(userId, bookId, isFavorite) {
    return mutateLibraryAndReload(
      userId,
      `/api/me/library/books/${encodeURIComponent(bookId)}/favorite`,
      { isFavorite },
    );
  },
  updateProgress(userId, bookId, progress) {
    return mutateLibraryAndReload(
      userId,
      `/api/me/library/books/${encodeURIComponent(bookId)}/progress`,
      { progress },
    );
  },
};
