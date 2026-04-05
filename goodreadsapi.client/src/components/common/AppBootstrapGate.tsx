import type { PropsWithChildren } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLibrary } from '@/context/LibraryContext';
import { LoadingSkeleton } from './LoadingSkeleton';

export function AppBootstrapGate({ children }: PropsWithChildren) {
  const {
    error: authError,
    retry: retryAuth,
    status: authStatus,
  } = useAuth();
  const {
    error: libraryError,
    retry: retryLibrary,
    status: libraryStatus,
  } = useLibrary();

  if (authStatus === 'loading' || libraryStatus === 'loading') {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <div className="stats-grid">
            <LoadingSkeleton variant="stats" />
            <LoadingSkeleton variant="stats" />
            <LoadingSkeleton variant="stats" />
          </div>
          <div className="book-grid" style={{ marginTop: '1rem' }}>
            <LoadingSkeleton variant="book" />
            <LoadingSkeleton variant="book" />
            <LoadingSkeleton variant="book" />
          </div>
        </div>
      </section>
    );
  }

  if (authStatus === 'error' || libraryStatus === 'error') {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <div className="empty-state">
            <span className="eyebrow">Application state</span>
            <h3>We could not restore the app state.</h3>
            <p>
              {authError ?? libraryError ?? 'A bootstrap step failed before the interface could finish loading.'}
            </p>
            <div className="auth-form__footer">
              <button type="button" className="button button--primary" onClick={() => {
                retryAuth();
                retryLibrary();
              }}>
                Retry loading
              </button>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => window.location.reload()}
              >
                Reload app
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return children;
}
