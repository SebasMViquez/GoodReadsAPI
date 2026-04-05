import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, NotebookPen, Shield, UsersRound } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { ListTabs } from '@/components/common/ListTabs';
import { Reveal } from '@/components/common/Reveal';
import { SearchBar } from '@/components/common/SearchBar';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { StatsCard } from '@/components/common/StatsCard';
import { UserCard } from '@/components/common/UserCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeUser } from '@/i18n/localize';
import type { User } from '@/types';

type ReaderFilter = 'for-you' | 'popular' | 'following' | 'private';

export function ReadersPage() {
  const { locale, t, ui } = useLanguage();
  const { currentUser, topReviewers, users, getFollowingForUser, getReviewsForUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [readerFilter, setReaderFilter] = useState<ReaderFilter>('for-you');
  const deferredSearch = useDeferredValue(searchTerm);
  const normalizedSearch = deferredSearch.trim().toLowerCase().replace(/^@/, '');
  const readersExcludingCurrent = useMemo(
    () => users.filter((user) => user.id !== currentUser?.id),
    [currentUser?.id, users],
  );
  const followingUsers = useMemo(
    () => (currentUser ? getFollowingForUser(currentUser.id) : []),
    [currentUser, getFollowingForUser],
  );
  const followingIds = useMemo(
    () => new Set(followingUsers.map((user) => user.id)),
    [followingUsers],
  );

  const getAffinityScore = useCallback((user: User) => {
    if (!currentUser) {
      return user.followersCount / 1000 + user.booksRead / 100;
    }

    const sharedGenres = user.favoriteGenres.filter((genre) =>
      currentUser.favoriteGenres.includes(genre),
    ).length;

    return (
      sharedGenres * 4 +
      user.booksRead / 50 +
      getReviewsForUser(user.id).length +
      (followingIds.has(user.id) ? 3 : 0)
    );
  }, [currentUser, followingIds, getReviewsForUser]);

  const filteredReaders = useMemo(() => {
    const matchesSearch = (user: User) => {
      const localizedUser = localizeUser(user, locale);
      const haystack =
        `${user.username} ${user.name} ${localizedUser.role} ${localizedUser.bio}`.toLowerCase();

      return normalizedSearch.length === 0 || haystack.includes(normalizedSearch);
    };

    const scopedReaders = readersExcludingCurrent.filter((user) => {
      if (!matchesSearch(user)) {
        return false;
      }

      if (readerFilter === 'following') {
        return followingIds.has(user.id);
      }

      if (readerFilter === 'private') {
        return user.profileVisibility === 'private';
      }

      return true;
    });

    return [...scopedReaders].sort((leftUser, rightUser) => {
      if (readerFilter === 'popular') {
        return rightUser.followersCount - leftUser.followersCount;
      }

      if (readerFilter === 'following') {
        return rightUser.booksRead - leftUser.booksRead;
      }

      if (readerFilter === 'private') {
        return rightUser.followersCount - leftUser.followersCount;
      }

      return getAffinityScore(rightUser) - getAffinityScore(leftUser);
    });
  }, [followingIds, getAffinityScore, locale, normalizedSearch, readerFilter, readersExcludingCurrent]);

  const spotlightReaders = normalizedSearch
    ? filteredReaders.slice(0, 3)
    : readerFilter === 'popular'
      ? filteredReaders.slice(0, 3)
      : readerFilter === 'following'
        ? filteredReaders.slice(0, 3)
        : topReviewers.slice(0, 3);

  const leadReader = spotlightReaders[0];
  const stackedReaders = spotlightReaders.slice(1, 3);

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <div className="explore-layout">
          <div className="explore-layout__main">
            <Reveal>
              <div className="filter-bar filter-bar--stacked">
                <SearchBar
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={t({
                    en: 'Search by @username, name, or reading voice',
                    es: 'Busca por @username, nombre o estilo lector',
                  })}
                />

                <div className="discover-switch">
                  <ListTabs
                    items={[
                      { value: 'for-you', label: t({ en: 'For you', es: 'Para ti' }), helper: `${readersExcludingCurrent.length}` },
                      { value: 'popular', label: t({ en: 'Popular', es: 'Populares' }), helper: `${readersExcludingCurrent.filter((user) => user.followersCount >= 1500).length}` },
                      { value: 'following', label: t({ en: 'Following', es: 'Siguiendo' }), helper: `${followingUsers.length}` },
                      { value: 'private', label: t({ en: 'Private', es: 'Privados' }), helper: `${readersExcludingCurrent.filter((user) => user.profileVisibility === 'private').length}` },
                    ]}
                    value={readerFilter}
                    onChange={(value) => setReaderFilter(value as ReaderFilter)}
                  />
                </div>
              </div>
            </Reveal>

            {!normalizedSearch && leadReader ? (
              <>
                <Reveal delay={0.06}>
                  <SectionHeader
                    eyebrow={t({ en: 'Suggested', es: 'Sugeridos' })}
                    title={t({ en: 'Readers to start with', es: 'Lectores para empezar' })}
                  />
                </Reveal>

                <div className="readers-stage">
                  <div className="readers-stage__lead">
                    <UserCard user={leadReader} />
                  </div>
                  <div className="readers-stage__stack">
                    {stackedReaders.map((user, index) => (
                      <Reveal key={user.id} delay={index * 0.04}>
                        <UserCard user={user} compact />
                      </Reveal>
                    ))}
                  </div>
                </div>
              </>
            ) : null}

            <Reveal delay={0.08}>
              <SectionHeader
                eyebrow={normalizedSearch ? t({ en: 'Results', es: 'Resultados' }) : t({ en: 'Readers', es: 'Lectores' })}
                title={
                  normalizedSearch
                    ? t({
                        en: `${filteredReaders.length} readers`,
                        es: `${filteredReaders.length} lectores`,
                      })
                    : t({
                        en: 'People to follow',
                        es: 'Personas para seguir',
                      })
                }
              />
            </Reveal>

            {filteredReaders.length ? (
              <div className="user-grid">
                {filteredReaders.map((user, index) => (
                  <Reveal key={user.id} delay={index * 0.03}>
                    <UserCard user={user} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <EmptyState
                  title={t({
                    en: 'No readers match this search',
                    es: 'Ningun lector coincide con esta busqueda',
                  })}
                  description={t({
                    en: 'Try another @username, broaden the name, or switch the reader lane.',
                    es: 'Prueba otro @username, amplia el nombre o cambia el carril de lectores.',
                  })}
                  actionLabel={t({ en: 'Open search', es: 'Abrir busqueda' })}
                  actionTo="/search?tab=users"
                />
              </Reveal>
            )}
          </div>

          <div className="explore-layout__side">
            <Reveal>
              <SidebarPanel title={t({ en: 'At a glance', es: 'De un vistazo' })}>
                <div className="stats-grid stats-grid--single">
                  <StatsCard
                    icon={UsersRound}
                    label={t({ en: 'Readers', es: 'Lectores' })}
                    value={`${readersExcludingCurrent.length}`}
                    description={t({ en: 'Profiles available to explore.', es: 'Perfiles disponibles.' })}
                  />
                  <StatsCard
                    icon={NotebookPen}
                    label={t({ en: 'Top voices', es: 'Voces destacadas' })}
                    value={`${topReviewers.length}`}
                    description={t({ en: 'Readers surfaced first.', es: 'Lectores destacados primero.' })}
                  />
                  <StatsCard
                    icon={Shield}
                    label={t({ en: 'Private', es: 'Privados' })}
                    value={`${readersExcludingCurrent.filter((user) => user.profileVisibility === 'private').length}`}
                    description={t({ en: 'Profiles with approval.', es: 'Perfiles con aprobacion.' })}
                  />
                  <StatsCard
                    icon={Compass}
                    label={t({ en: 'Following', es: 'Siguiendo' })}
                    value={`${followingUsers.length}`}
                    description={t({ en: 'Already in your orbit.', es: 'Ya en tu orbita.' })}
                  />
                </div>

                <div className="search-side-links">
                  <Link to="/explore">{t(ui.nav.discover)}</Link>
                  <Link to="/search?tab=users">{t({ en: 'Search users', es: 'Buscar usuarios' })}</Link>
                </div>
              </SidebarPanel>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
