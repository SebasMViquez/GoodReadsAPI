import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { libraryClient } from '@/services/api/libraryClient';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { UserLibraryState } from '@/services/api/mock/libraryState';
import { reportError, trackEvent } from '@/services/monitoring/reporting';
import type { ReadingProgress, ShelfStatus, User } from '@/types';
type ShelfMap = UserLibraryState['shelves'];

interface LibraryContextValue {
  error: string | null;
  profile: User | null;
  retry: () => void;
  status: 'loading' | 'ready' | 'error';
  shelves: ShelfMap;
  favorites: string[];
  setShelf: (bookId: string, shelf: ShelfStatus) => void;
  getShelfForBook: (bookId: string) => ShelfStatus | null;
  toggleFavorite: (bookId: string) => void;
  updateProgress: (bookId: string, progress: number) => void;
  isFavorite: (bookId: string) => boolean;
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: PropsWithChildren) {
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id ?? null;
  const { showToast } = useToast();
  const [libraryStateByUser, setLibraryStateByUser] = useState<
    Record<string, UserLibraryState>
  >({});
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [bootstrapVersion, setBootstrapVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      setStatus('loading');
      setError(null);

      try {
        const nextState = await libraryClient.hydrate();

        if (cancelled) {
          return;
        }

        setLibraryStateByUser(nextState);
        setStatus('ready');
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        reportError(caughtError, { scope: 'library.hydrate' });
        setError('We could not restore the library state.');
        setStatus('error');
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [bootstrapVersion]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    void libraryClient.persist(libraryStateByUser).catch((caughtError) => {
      reportError(caughtError, { scope: 'library.persist' });
      setError('We could not save the latest library state.');
      setStatus('error');
    });
  }, [libraryStateByUser, status]);

  const retry = useCallback(() => {
    setBootstrapVersion((currentValue) => currentValue + 1);
  }, []);

  const activeState = useMemo(() => {
    if (!currentUser) {
      return libraryClient.emptyLibraryState;
    }

    return libraryStateByUser[currentUser.id] ?? libraryClient.createDefaultStateForUser(currentUser);
  }, [currentUser, libraryStateByUser]);

  const updateActiveState = (updater: (currentState: UserLibraryState) => UserLibraryState) => {
    if (!currentUser) {
      return;
    }

    setLibraryStateByUser((currentStateByUser) => ({
      ...currentStateByUser,
      [currentUser.id]: updater(
        currentStateByUser[currentUser.id] ?? libraryClient.createDefaultStateForUser(currentUser),
      ),
    }));
  };

  const replaceActiveState = useCallback(
    (nextState: UserLibraryState) => {
      if (!currentUser) {
        return;
      }

      setLibraryStateByUser((currentStateByUser) => ({
        ...currentStateByUser,
        [currentUser.id]: nextState,
      }));
    },
    [currentUser],
  );

  const refreshLibraryFromBackend = useCallback(async () => {
    if (!currentUser || !libraryClient.isBackendEnabled()) {
      return;
    }

    try {
      const remoteState = await libraryClient.fetchForUser(currentUser.id);
      replaceActiveState(remoteState);
    } catch (caughtError) {
      reportError(caughtError, { scope: 'library.remoteSync' });
      setError('We could not sync the latest library data from backend.');
    }
  }, [currentUser, replaceActiveState]);

  useEffect(() => {
    if (status !== 'ready' || !currentUserId || !libraryClient.isBackendEnabled()) {
      return;
    }

    void refreshLibraryFromBackend();
  }, [currentUserId, refreshLibraryFromBackend, status]);

  const setShelf = (bookId: string, targetShelf: ShelfStatus) => {
    if (!currentUser) {
      return;
    }

    if (libraryClient.isBackendEnabled()) {
      void (async () => {
        try {
          const nextState = await libraryClient.setShelf(currentUser.id, bookId, targetShelf);
          replaceActiveState(nextState);

          showToast(
            {
              en:
                targetShelf === 'want-to-read'
                  ? 'Saved to Want to Read.'
                  : targetShelf === 'currently-reading'
                    ? 'Moved to Currently Reading.'
                    : 'Marked as Read.',
              es:
                targetShelf === 'want-to-read'
                  ? 'Guardado en Quiero leer.'
                  : targetShelf === 'currently-reading'
                    ? 'Movido a Leyendo ahora.'
                    : 'Marcado como Leido.',
            },
            'success',
          );
          trackEvent('library_shelf_updated', { bookId, shelf: targetShelf });
        } catch (caughtError) {
          reportError(caughtError, { scope: 'library.setShelf', bookId, shelf: targetShelf });
          showToast(
            {
              en: 'Could not update shelf right now.',
              es: 'No se pudo actualizar el estante en este momento.',
            },
            'warning',
          );
        }
      })();

      return;
    }

    updateActiveState((currentState) => {
      const nextShelves: ShelfMap = {
        'want-to-read': currentState.shelves['want-to-read'].filter((id) => id !== bookId),
        'currently-reading': currentState.shelves['currently-reading'].filter(
          (id) => id !== bookId,
        ),
        read: currentState.shelves.read.filter((id) => id !== bookId),
      };

      nextShelves[targetShelf] = [bookId, ...nextShelves[targetShelf]];

      return {
        ...currentState,
        shelves: nextShelves,
        progressMap:
          targetShelf === 'currently-reading' && !currentState.progressMap[bookId]
            ? {
                ...currentState.progressMap,
                [bookId]: 18,
              }
            : currentState.progressMap,
      };
    });

    showToast(
      {
        en:
          targetShelf === 'want-to-read'
            ? 'Saved to Want to Read.'
            : targetShelf === 'currently-reading'
              ? 'Moved to Currently Reading.'
              : 'Marked as Read.',
        es:
          targetShelf === 'want-to-read'
            ? 'Guardado en Quiero leer.'
            : targetShelf === 'currently-reading'
              ? 'Movido a Leyendo ahora.'
              : 'Marcado como Leido.',
      },
      'success',
    );
    trackEvent('library_shelf_updated', { bookId, shelf: targetShelf });
  };

  const getShelfForBook = (bookId: string) => {
    if (activeState.shelves['want-to-read'].includes(bookId)) {
      return 'want-to-read';
    }

    if (activeState.shelves['currently-reading'].includes(bookId)) {
      return 'currently-reading';
    }

    if (activeState.shelves.read.includes(bookId)) {
      return 'read';
    }

    return null;
  };

  const toggleFavorite = (bookId: string) => {
    if (!currentUser) {
      return;
    }

    const willFavorite = !activeState.favorites.includes(bookId);

    if (libraryClient.isBackendEnabled()) {
      void (async () => {
        try {
          const nextState = await libraryClient.setFavorite(currentUser.id, bookId, willFavorite);
          replaceActiveState(nextState);

          showToast(
            willFavorite
              ? { en: 'Added to favorites.', es: 'Agregado a favoritos.' }
              : { en: 'Removed from favorites.', es: 'Quitado de favoritos.' },
            'info',
          );
          trackEvent('library_favorite_toggled', { bookId, favorite: willFavorite });
        } catch (caughtError) {
          reportError(caughtError, { scope: 'library.toggleFavorite', bookId, favorite: willFavorite });
          showToast(
            {
              en: 'Could not update favorite state right now.',
              es: 'No se pudo actualizar favoritos en este momento.',
            },
            'warning',
          );
        }
      })();

      return;
    }

    updateActiveState((currentState) => ({
      ...currentState,
      favorites: currentState.favorites.includes(bookId)
        ? currentState.favorites.filter((id) => id !== bookId)
        : [bookId, ...currentState.favorites],
    }));

    showToast(
      willFavorite
        ? { en: 'Added to favorites.', es: 'Agregado a favoritos.' }
        : { en: 'Removed from favorites.', es: 'Quitado de favoritos.' },
      'info',
    );
    trackEvent('library_favorite_toggled', { bookId, favorite: willFavorite });
  };

  const updateProgress = (bookId: string, progress: number) => {
    if (!currentUser) {
      return;
    }

    const nextValue = Math.min(100, Math.max(0, progress));

    if (libraryClient.isBackendEnabled()) {
      void (async () => {
        try {
          const nextState = await libraryClient.updateProgress(currentUser.id, bookId, nextValue);
          replaceActiveState(nextState);

          if (nextValue === 100) {
            showToast(
              {
                en: 'Reading progress completed.',
                es: 'Progreso de lectura completado.',
              },
              'success',
            );
          }

          trackEvent('library_progress_updated', { bookId, progress: nextValue });
        } catch (caughtError) {
          reportError(caughtError, { scope: 'library.updateProgress', bookId, progress: nextValue });
          showToast(
            {
              en: 'Could not update reading progress right now.',
              es: 'No se pudo actualizar el progreso de lectura en este momento.',
            },
            'warning',
          );
        }
      })();

      return;
    }

    updateActiveState((currentState) => {
      const nextShelves = currentState.shelves['currently-reading'].includes(bookId)
        ? currentState.shelves
        : {
            ...currentState.shelves,
            'want-to-read': currentState.shelves['want-to-read'].filter((id) => id !== bookId),
            read: currentState.shelves.read.filter((id) => id !== bookId),
            'currently-reading': [bookId, ...currentState.shelves['currently-reading']],
          };

      return {
        ...currentState,
        shelves: nextShelves,
        progressMap: {
          ...currentState.progressMap,
          [bookId]: nextValue,
        },
      };
    });

    if (nextValue === 100) {
      showToast(
        {
          en: 'Reading progress completed.',
          es: 'Progreso de lectura completado.',
        },
        'success',
      );
    }

    trackEvent('library_progress_updated', { bookId, progress: nextValue });
  };

  const profile = currentUser
    ? {
        ...currentUser,
        wantToRead: activeState.shelves['want-to-read'],
        currentlyReading: activeState.shelves['currently-reading'].map(
          (bookId): ReadingProgress => ({
            bookId,
            progress: activeState.progressMap[bookId] ?? 0,
          }),
        ),
        read: activeState.shelves.read,
        favoriteBooks: activeState.favorites,
        booksRead: activeState.shelves.read.length + currentUser.booksRead - currentUser.read.length,
      }
    : null;

  return (
    <LibraryContext.Provider
      value={{
        error,
        profile,
        retry,
        status,
        shelves: activeState.shelves,
        favorites: activeState.favorites,
        setShelf,
        getShelfForBook,
        toggleFavorite,
        updateProgress,
        isFavorite: (bookId: string) => activeState.favorites.includes(bookId),
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => {
  const context = useContext(LibraryContext);

  if (!context) {
    throw new Error('useLibrary must be used inside LibraryProvider');
  }

  return context;
};

