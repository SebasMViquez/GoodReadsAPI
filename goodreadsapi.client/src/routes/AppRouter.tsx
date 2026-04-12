import { Suspense, lazy, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { PageTransition } from '@/components/common/PageTransition';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { AppLayout } from '@/layouts/AppLayout';
import { trackEvent } from '@/services/monitoring/reporting';
import { ProtectedRoute } from './ProtectedRoute';

const HomePage = lazy(() => import('@/pages/HomePage').then((module) => ({ default: module.HomePage })));
const SearchPage = lazy(() => import('@/pages/SearchPage').then((module) => ({ default: module.SearchPage })));
const ExplorePage = lazy(() => import('@/pages/ExplorePage').then((module) => ({ default: module.ExplorePage })));
const ReadersPage = lazy(() => import('@/pages/ReadersPage').then((module) => ({ default: module.ReadersPage })));
const BookDetailsPage = lazy(() => import('@/pages/BookDetailsPage').then((module) => ({ default: module.BookDetailsPage })));
const CommunityPage = lazy(() => import('@/pages/CommunityPage').then((module) => ({ default: module.CommunityPage })));
const LoginPage = lazy(() => import('@/pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/RegisterPage').then((module) => ({ default: module.RegisterPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const LibraryPage = lazy(() => import('@/pages/LibraryPage').then((module) => ({ default: module.LibraryPage })));
const MessagesPage = lazy(() => import('@/pages/MessagesPage').then((module) => ({ default: module.MessagesPage })));
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then((module) => ({ default: module.NotificationsPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((module) => ({ default: module.SettingsPage })));
const BooksLabPage = lazy(() => import('@/pages/BooksLabPage').then((module) => ({ default: module.BooksLabPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

function RouteFallback() {
  return (
    <section className="section page-top-spacing">
      <div className="container">
        <div className="stats-grid">
          <LoadingSkeleton variant="stats" />
          <LoadingSkeleton variant="stats" />
        </div>
        <div className="book-grid" style={{ marginTop: '1rem' }}>
          <LoadingSkeleton variant="book" />
          <LoadingSkeleton variant="book" />
        </div>
      </div>
    </section>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    trackEvent('page_viewed', {
      path: `${location.pathname}${location.search}`,
    });
  }, [location.pathname, location.search]);

  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location} key={location.pathname}>
            <Route element={<AppLayout />}>
              <Route
                index
                element={
                  <PageTransition>
                    <HomePage />
                  </PageTransition>
                }
              />
              <Route
                path="/search"
                element={
                  <PageTransition>
                    <SearchPage />
                  </PageTransition>
                }
              />
              <Route
                path="/explore"
                element={
                  <PageTransition>
                    <ExplorePage />
                  </PageTransition>
                }
              />
              <Route
                path="/readers"
                element={
                  <PageTransition>
                    <ReadersPage />
                  </PageTransition>
                }
              />
              <Route
                path="/books/:slug"
                element={
                  <PageTransition>
                    <BookDetailsPage />
                  </PageTransition>
                }
              />
              <Route
                path="/community"
                element={
                  <PageTransition>
                    <CommunityPage />
                  </PageTransition>
                }
              />
              {import.meta.env.DEV ? (
                <Route
                  path="/dev/books-lab"
                  element={
                    <PageTransition>
                      <BooksLabPage />
                    </PageTransition>
                  }
                />
              ) : null}
              <Route
                path="/login"
                element={
                  <PageTransition>
                    <LoginPage />
                  </PageTransition>
                }
              />
              <Route
                path="/register"
                element={
                  <PageTransition>
                    <RegisterPage />
                  </PageTransition>
                }
              />
              <Route
                path="/profile/:username"
                element={
                  <PageTransition>
                    <ProfilePage />
                  </PageTransition>
                }
              />
              <Route element={<ProtectedRoute />}>
                <Route
                  path="/library"
                  element={
                    <PageTransition>
                      <LibraryPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <PageTransition>
                      <MessagesPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <PageTransition>
                      <NotificationsPage />
                    </PageTransition>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <PageTransition>
                      <SettingsPage />
                    </PageTransition>
                  }
                />
              </Route>
              <Route
                path="*"
                element={
                  <PageTransition>
                    <NotFoundPage />
                  </PageTransition>
                }
              />
            </Route>
          </Routes>
        </Suspense>
      </AnimatePresence>
    </>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
