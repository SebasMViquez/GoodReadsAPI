import type { ShelfStatus, User } from '@/types';
import { browserStorage } from '@/services/storage/browserStorage';

type ShelfMap = Record<ShelfStatus, string[]>;
type ProgressMap = Record<string, number>;

export interface UserLibraryState {
  shelves: ShelfMap;
  favorites: string[];
  progressMap: ProgressMap;
}

const libraryStorageKey = 'goodreads-library-state';

export const emptyShelves: ShelfMap = {
  'want-to-read': [],
  'currently-reading': [],
  read: [],
};

export const emptyLibraryState: UserLibraryState = {
  shelves: emptyShelves,
  favorites: [],
  progressMap: {},
};

export const createDefaultStateForUser = (user: User): UserLibraryState => ({
  shelves: {
    'want-to-read': user.wantToRead,
    'currently-reading': user.currentlyReading.map(({ bookId }) => bookId),
    read: user.read,
  },
  favorites: user.favoriteBooks,
  progressMap: user.currentlyReading.reduce((accumulator, entry) => {
    accumulator[entry.bookId] = entry.progress;
    return accumulator;
  }, {} as ProgressMap),
});

export const loadPersistedLibraryState = () => {
  const parsed = browserStorage.getJSON<Record<string, UserLibraryState> | UserLibraryState>(
    libraryStorageKey,
  );

  if (!parsed) {
    return {};
  }

  if (
    typeof parsed === 'object' &&
    'shelves' in parsed &&
    'favorites' in parsed &&
    'progressMap' in parsed
  ) {
    const legacyState = parsed as UserLibraryState;
    return {
      'user-amelia': {
        shelves: legacyState.shelves,
        favorites: legacyState.favorites,
        progressMap: legacyState.progressMap,
      },
    };
  }

  return parsed as Record<string, UserLibraryState>;
};

export const savePersistedLibraryState = (state: Record<string, UserLibraryState>) => {
  browserStorage.setJSON(libraryStorageKey, state);
};
