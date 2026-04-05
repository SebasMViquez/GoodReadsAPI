import {
  BadgeCheck,
  BookHeart,
  Flame,
  Lock,
  MapPin,
  MessageSquare,
  NotebookPen,
  Search,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { EmptyState } from '@/components/common/EmptyState';
import { GenreChip } from '@/components/common/GenreChip';
import { ListTabs } from '@/components/common/ListTabs';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { UserCard } from '@/components/common/UserCard';
import { ReviewCard } from '@/components/review/ReviewCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLibrary } from '@/context/LibraryContext';
import { getAuthorById, getBooksByIds, getBooksFromProgress } from '@/services/api/catalog';
import { localizeBook, localizeUser } from '@/i18n/localize';
import { getGenreLabel } from '@/i18n/ui';

type ProfileTab = 'activity' | 'reviews' | 'lists' | 'favorites' | 'network';

const hasCover = (cover: string | undefined | null) => Boolean(cover?.trim());

function ProfileCoverLink({
  book,
  title,
  className,
}: {
  book: ReturnType<typeof getBooksByIds>[number];
  title: string;
  className: string;
}) {
  const [isVisible, setIsVisible] = useState(hasCover(book.cover));

  useEffect(() => {
    setIsVisible(hasCover(book.cover));
  }, [book.cover]);

  if (!isVisible) {
    return null;
  }

  return (
    <Link to={`/books/${book.slug}`} className={className}>
      <img src={book.cover} alt={title} onError={() => setIsVisible(false)} />
    </Link>
  );
}

function ProfilePosterCard({
  book,
  locale,
  label,
  progress,
}: {
  book: ReturnType<typeof getBooksByIds>[number];
  locale: 'en' | 'es';
  label?: string;
  progress?: number;
}) {
  const localizedBook = localizeBook(book, locale);
  const author = getAuthorById(book.authorId);
  const [isVisible, setIsVisible] = useState(hasCover(book.cover));

  useEffect(() => {
    setIsVisible(hasCover(book.cover));
  }, [book.cover]);

  if (!isVisible) {
    return null;
  }

  return (
    <article className="profile-poster-card">
      <Link to={`/books/${book.slug}`} className="profile-poster-card__cover-link">
        <img
          src={book.cover}
          alt={localizedBook.title}
          className="profile-poster-card__cover"
          onError={() => setIsVisible(false)}
        />
        {label ? <span className="profile-poster-card__badge">{label}</span> : null}
        {typeof progress === 'number' ? (
          <span className="profile-poster-card__progress">{progress}%</span>
        ) : null}
      </Link>
      <div className="profile-poster-card__copy">
        <strong>{localizedBook.title}</strong>
        <span>{author?.name}</span>
      </div>
    </article>
  );
}

export function ProfilePage() {
  const { locale, t } = useLanguage();
  const { username = '' } = useParams();
  const { profile } = useLibrary();
  const {
    activityFeed,
    currentUser,
    getFollowersForUser,
    getFollowingForUser,
    getReviewsForUser,
    getUserByUsername,
    hasPendingFollowRequest,
    isAuthenticated,
    isFollowingUser,
    toggleFollowUser,
  } = useAuth();
  const [tab, setTab] = useState<ProfileTab>('activity');
  const [followersQuery, setFollowersQuery] = useState('');
  const [followingQuery, setFollowingQuery] = useState('');
  const isOwnProfile = currentUser?.username === username || profile?.username === username;
  const routeProfile = isOwnProfile ? profile ?? currentUser : getUserByUsername(username);

  if (!routeProfile) {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <EmptyState
            title={t({
              en: 'That profile is not available in this community',
              es: 'Ese perfil no esta disponible en esta comunidad',
            })}
            description={t({
              en: 'Try one of the seeded community profiles.',
              es: 'Prueba uno de los perfiles sembrados de la comunidad.',
            })}
            actionLabel={t({ en: 'Go to community', es: 'Ir a comunidad' })}
            actionTo="/community"
          />
        </div>
      </section>
    );
  }

  const localizedProfile = localizeUser(routeProfile, locale);
  const favoriteBooks = getBooksByIds(routeProfile.favoriteBooks);
  const wantToReadBooks = getBooksByIds(routeProfile.wantToRead);
  const readBooks = getBooksByIds(routeProfile.read);
  const currentlyReading = getBooksFromProgress(routeProfile.currentlyReading);
  const reviews = getReviewsForUser(routeProfile.id);
  const profileActivity = activityFeed.filter((activity) => activity.userId === routeProfile.id);
  const followers = getFollowersForUser(routeProfile.id);
  const following = getFollowingForUser(routeProfile.id);
  const normalizedFollowersQuery = followersQuery.trim().toLocaleLowerCase(locale);
  const normalizedFollowingQuery = followingQuery.trim().toLocaleLowerCase(locale);
  const filteredFollowers = followers.filter((user) => {
    if (!normalizedFollowersQuery) return true;

    const localizedUser = localizeUser(user, locale);
    const searchableContent = [user.name, user.username, localizedUser.role, localizedUser.bio]
      .join(' ')
      .toLocaleLowerCase(locale);

    return searchableContent.includes(normalizedFollowersQuery);
  });
  const filteredFollowing = following.filter((user) => {
    if (!normalizedFollowingQuery) return true;

    const localizedUser = localizeUser(user, locale);
    const searchableContent = [user.name, user.username, localizedUser.role, localizedUser.bio]
      .join(' ')
      .toLocaleLowerCase(locale);

    return searchableContent.includes(normalizedFollowingQuery);
  });
  const isPrivateProfile = routeProfile.profileVisibility === 'private' && !isOwnProfile;
  const hasPendingRequest = hasPendingFollowRequest(routeProfile.id);
  const pinnedFavorite = favoriteBooks[0];
  const currentHighlight = currentlyReading[0];
  const recentActivity = profileActivity.slice(0, 3);
  const recentReview = reviews[0];
  const heroGalleryBooks = [...currentlyReading, ...favoriteBooks, ...readBooks].filter(
    (book, index, collection) => collection.findIndex((candidate) => candidate.id === book.id) === index,
  );

  const tabItems = [
    { value: 'activity' as const, label: t({ en: 'Activity', es: 'Actividad' }), helper: `${profileActivity.length}` },
    { value: 'reviews' as const, label: t({ en: 'Reviews', es: 'Resenas' }), helper: `${reviews.length}` },
    { value: 'lists' as const, label: t({ en: 'Shelves', es: 'Estantes' }), helper: `${currentlyReading.length + wantToReadBooks.length + readBooks.length}` },
    { value: 'favorites' as const, label: t({ en: 'Gallery', es: 'Galeria' }), helper: `${favoriteBooks.length}` },
    { value: 'network' as const, label: t({ en: 'Network', es: 'Red' }), helper: `${followers.length + following.length}` },
  ];

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <Reveal>
          <div className="profile-hero">
            <div className="profile-hero__banner">
              <img src={routeProfile.banner} alt={`${routeProfile.name} banner`} />
            </div>
            <div className="profile-hero__top">
              <div className="profile-hero__identity">
                <img src={routeProfile.avatar} alt={routeProfile.name} />
                <div>
                  <span className="eyebrow">{t({ en: 'Profile', es: 'Perfil' })}</span>
                  <h1>{routeProfile.name}</h1>
                  <p>@{routeProfile.username}</p>
                  <div className="profile-hero__meta">
                    <span>
                      <MapPin size={14} /> {routeProfile.location}
                    </span>
                    <span>
                      <BadgeCheck size={14} /> {localizedProfile.followers}
                    </span>
                    <span>{localizedProfile.following}</span>
                  </div>
                </div>
              </div>
              <div className="profile-hero__gallery">
                <div className="profile-hero__gallery-copy">
                  <span className="eyebrow">{t({ en: 'Shelf gallery', es: 'Galeria de estantes' })}</span>
                  <strong>{t({ en: 'Recent covers', es: 'Portadas recientes' })}</strong>
                </div>
                <div className="profile-hero__cover-wall">
                  {heroGalleryBooks.slice(0, 4).map((book, index) => (
                    <ProfileCoverLink
                      key={book.id}
                      book={book}
                      title={localizeBook(book, locale).title}
                      className={index === 0 ? 'profile-hero__cover profile-hero__cover--lead' : 'profile-hero__cover'}
                    />
                  ))}
                </div>
              </div>

            </div>

            <div className="profile-hero__bio">
              <div className="profile-hero__metrics">
                <span>
                  <BookHeart size={15} />
                  {routeProfile.booksRead} {t({ en: 'books read', es: 'libros leidos' })}
                </span>
                <span>
                  <NotebookPen size={15} />
                  {reviews.length} {t({ en: 'reviews', es: 'resenas' })}
                </span>
                <span>
                  <Flame size={15} />
                  {routeProfile.streak} {t({ en: 'day streak', es: 'dias de racha' })}
                </span>
              </div>
              <p>{localizedProfile.bio}</p>
              <div className="profile-hero__lede">
                <span>{localizedProfile.role}</span>
                <span>{routeProfile.favoriteGenres.slice(0, 3).map((genre) => getGenreLabel(genre, locale)).join(' · ')}</span>
                <span>{routeProfile.booksRead} {t({ en: 'books read', es: 'libros leidos' })}</span>
              </div>
              <div className="chip-row">
                {localizedProfile.badges.map((badge) => (
                  <span key={badge} className="chip chip--accent">
                    {badge}
                  </span>
                ))}
              </div>
              <div className="profile-hero__actions">
                {isOwnProfile ? (
                  <Link className="button button--ghost" to="/settings?tab=profile">
                    <NotebookPen size={14} />
                    {t({ en: 'Edit profile', es: 'Editar perfil' })}
                  </Link>
                ) : (
                  <>
                    <button
                      type="button"
                      className={
                        isFollowingUser(routeProfile.id) || hasPendingRequest
                          ? 'button button--ghost'
                          : 'button button--primary'
                      }
                      onClick={() => toggleFollowUser(routeProfile.id)}
                      disabled={!isAuthenticated || hasPendingRequest}
                    >
                      {hasPendingRequest
                        ? t({ en: 'Request sent', es: 'Solicitud enviada' })
                        : isFollowingUser(routeProfile.id)
                          ? t({ en: 'Following', es: 'Siguiendo' })
                          : t({ en: 'Follow', es: 'Seguir' })}
                    </button>
                    <Link
                      className="button button--ghost"
                      to={isAuthenticated ? `/messages?user=${routeProfile.username}` : '/login'}
                    >
                      <MessageSquare size={14} />
                      {t({ en: 'Message', es: 'Mensaje' })}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </Reveal>

        {isPrivateProfile ? (
          <div className="profile-private-card">
            <Lock size={20} />
            <div>
              <h2>{t({ en: 'This profile is private', es: 'Este perfil es privado' })}</h2>
              <p>
                {t({
                  en: 'The public header is visible, but shelves, reviews, and deeper activity stay hidden.',
                  es: 'El encabezado publico es visible, pero los estantes, resenas y la actividad profunda quedan ocultos.',
                })}
              </p>
            </div>
          </div>
        ) : (
          <div className="profile-layout">
            <div className="profile-layout__main">
              <div className="chip-row">
                {routeProfile.favoriteGenres.map((genre) => (
                  <GenreChip key={genre} label={getGenreLabel(genre, locale)} />
                ))}
              </div>

              <Reveal delay={0.04}>
                <div className="profile-tabs">
                  <ListTabs items={tabItems} value={tab} onChange={setTab} />
                </div>
              </Reveal>

              {tab !== 'network' ? (
                <div className="profile-highlights">
                  {pinnedFavorite ? (
                    <article className="profile-highlight-card">
                      <img src={pinnedFavorite.cover} alt={localizeBook(pinnedFavorite, locale).title} />
                      <div className="profile-highlight-card__copy">
                        <span className="eyebrow">{t({ en: 'Pinned favorite', es: 'Favorito fijado' })}</span>
                        <strong>{localizeBook(pinnedFavorite, locale).title}</strong>
                        <p>{localizeBook(pinnedFavorite, locale).shortDescription}</p>
                      </div>
                    </article>
                  ) : null}

                  {currentHighlight ? (
                    <article className="profile-highlight-card profile-highlight-card--reading">
                      <img src={currentHighlight.cover} alt={localizeBook(currentHighlight, locale).title} />
                      <div className="profile-highlight-card__copy">
                        <span className="eyebrow">{t({ en: 'Reading now', es: 'Leyendo ahora' })}</span>
                        <strong>{localizeBook(currentHighlight, locale).title}</strong>
                        <p>{currentHighlight.progress}% {t({ en: 'completed', es: 'completado' })}</p>
                      </div>
                    </article>
                  ) : null}
                </div>
              ) : null}

              {tab !== 'network' ? (
                <div className="profile-showcase-grid">
                  {recentReview ? (
                    <article className="profile-showcase-card profile-showcase-card--review">
                      <span className="eyebrow">{t({ en: 'Latest review', es: 'Ultima resena' })}</span>
                      <strong>{recentReview.title[locale]}</strong>
                      <p>{recentReview.excerpt[locale]}</p>
                    </article>
                  ) : null}

                  {heroGalleryBooks.length ? (
                    <article className="profile-showcase-card profile-showcase-card--covers">
                      <span className="eyebrow">{t({ en: 'Cover wall', es: 'Muro de portadas' })}</span>
                      <div className="profile-cover-strip">
                        {heroGalleryBooks.slice(0, 6).map((book) => (
                          <ProfileCoverLink
                            key={book.id}
                            book={book}
                            title={localizeBook(book, locale).title}
                            className="profile-cover-strip__item"
                          />
                        ))}
                      </div>
                    </article>
                  ) : null}
                </div>
              ) : null}

              {tab === 'activity' ? (
                <>
                  <SectionHeader eyebrow={t({ en: 'Activity', es: 'Actividad' })} title={t({ en: 'Recent activity', es: 'Actividad reciente' })} />
                  <div className="activity-feed">
                    {profileActivity.slice(0, 6).map((activity, index) => (
                      <Reveal key={activity.id} delay={index * 0.04}>
                        <ActivityCard activity={activity} compact={index > 0} />
                      </Reveal>
                    ))}
                  </div>
                </>
              ) : null}

              {tab === 'reviews' ? (
                <>
                  <SectionHeader eyebrow={t({ en: 'Reviews', es: 'Resenas' })} title={t({ en: 'Reviews', es: 'Resenas' })} />
                  <div className="review-grid">
                    {reviews.map((review, index) => (
                      <Reveal key={review.id} delay={index * 0.05}>
                        <ReviewCard review={review} variant={index === 0 ? 'feature' : 'default'} />
                      </Reveal>
                    ))}
                  </div>
                </>
              ) : null}

              {tab === 'lists' ? (
                <div className="profile-stack">
                  <SectionHeader eyebrow={t({ en: 'Shelves', es: 'Estantes' })} title={t({ en: 'Shelf gallery', es: 'Galeria de estantes' })} />
                  <div className="profile-shelf-section">
                    <h3>{t({ en: 'Currently reading', es: 'Leyendo ahora' })}</h3>
                    <div className="profile-poster-grid">
                      {currentlyReading.length ? (
                        currentlyReading.map((book, index) => (
                          <Reveal key={book.id} delay={index * 0.04}>
                            <ProfilePosterCard
                              book={book}
                              locale={locale}
                              progress={book.progress}
                              label={t({ en: 'Reading now', es: 'Leyendo ahora' })}
                            />
                          </Reveal>
                        ))
                      ) : (
                        <div className="profile-inline-empty">
                          {t({ en: 'Nothing in progress right now.', es: 'No hay nada en progreso ahora mismo.' })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="profile-shelf-section">
                    <h3>{t({ en: 'Want to read', es: 'Quiero leer' })}</h3>
                    <div className="profile-poster-grid">
                      {wantToReadBooks.length ? (
                        wantToReadBooks.slice(0, 8).map((book, index) => (
                          <Reveal key={book.id} delay={index * 0.04}>
                            <ProfilePosterCard
                              book={book}
                              locale={locale}
                              label={t({ en: 'Want to read', es: 'Quiero leer' })}
                            />
                          </Reveal>
                        ))
                      ) : (
                        <div className="profile-inline-empty">
                          {t({ en: 'No future reads saved yet.', es: 'Todavia no hay futuras lecturas guardadas.' })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="profile-shelf-section">
                    <h3>{t({ en: 'Read', es: 'Leidos' })}</h3>
                    <div className="profile-poster-grid">
                      {readBooks.length ? (
                        readBooks.slice(0, 8).map((book, index) => (
                          <Reveal key={book.id} delay={index * 0.04}>
                            <ProfilePosterCard
                              book={book}
                              locale={locale}
                              label={t({ en: 'Read', es: 'Leido' })}
                            />
                          </Reveal>
                        ))
                      ) : (
                        <div className="profile-inline-empty">
                          {t({ en: 'No finished books in this visible shelf.', es: 'No hay libros terminados en este estante visible.' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {tab === 'favorites' ? (
                <>
                  <SectionHeader eyebrow={t({ en: 'Gallery', es: 'Galeria' })} title={t({ en: 'Pinned and loved books', es: 'Libros fijados y queridos' })} />
                  <div className="profile-poster-grid profile-poster-grid--gallery">
                    {favoriteBooks.length ? (
                      favoriteBooks.map((book, index) => (
                        <Reveal key={book.id} delay={index * 0.04}>
                          <ProfilePosterCard
                            book={book}
                            locale={locale}
                            label={t({ en: 'Favorite', es: 'Favorito' })}
                          />
                        </Reveal>
                      ))
                    ) : (
                      <EmptyState
                        title={t({ en: 'No favorite books yet', es: 'Todavia no hay libros favoritos' })}
                        description={t({ en: 'This shelf will appear here once favorites are pinned.', es: 'Este estante aparecera aqui cuando se fijen favoritos.' })}
                        actionLabel={t({ en: 'Explore books', es: 'Explorar libros' })}
                        actionTo="/explore"
                      />
                    )}
                  </div>
                </>
              ) : null}

              {tab === 'network' ? (
                <div className="profile-network-grid">
                  <div className="profile-network-section">
                    <SectionHeader eyebrow={t({ en: 'Followers', es: 'Seguidores' })} title={t({ en: 'Followers', es: 'Seguidores' })} />
                    <div className="profile-network-toolbar">
                      <label className="search-bar profile-network-search">
                        <Search size={16} />
                        <input
                          type="search"
                          value={followersQuery}
                          onChange={(event) => setFollowersQuery(event.target.value)}
                          placeholder={t({ en: 'Search followers', es: 'Buscar seguidores' })}
                          aria-label={t({ en: 'Search followers', es: 'Buscar seguidores' })}
                        />
                      </label>
                      <span className="profile-network-count">
                        {filteredFollowers.length} {t({ en: 'results', es: 'resultados' })}
                      </span>
                    </div>
                    <div className="user-grid">
                      {filteredFollowers.length ? (
                        filteredFollowers.map((user, index) => (
                          <Reveal key={user.id} delay={index * 0.04}>
                            <UserCard user={user} compact />
                          </Reveal>
                        ))
                      ) : (
                        <div className="profile-inline-empty">
                          {followersQuery
                            ? t({ en: 'No followers match that search.', es: 'No hay seguidores que coincidan con esa busqueda.' })
                            : t({ en: 'No followers visible yet.', es: 'Todavia no hay seguidores visibles.' })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="profile-network-section">
                    <SectionHeader eyebrow={t({ en: 'Following', es: 'Siguiendo' })} title={t({ en: 'Following', es: 'Siguiendo' })} />
                    <div className="profile-network-toolbar">
                      <label className="search-bar profile-network-search">
                        <Search size={16} />
                        <input
                          type="search"
                          value={followingQuery}
                          onChange={(event) => setFollowingQuery(event.target.value)}
                          placeholder={t({ en: 'Search following', es: 'Buscar seguidos' })}
                          aria-label={t({ en: 'Search following', es: 'Buscar seguidos' })}
                        />
                      </label>
                      <span className="profile-network-count">
                        {filteredFollowing.length} {t({ en: 'results', es: 'resultados' })}
                      </span>
                    </div>
                    <div className="user-grid">
                      {filteredFollowing.length ? (
                        filteredFollowing.map((user, index) => (
                          <Reveal key={user.id} delay={index * 0.04}>
                            <UserCard user={user} compact />
                          </Reveal>
                        ))
                      ) : (
                        <div className="profile-inline-empty">
                          {followingQuery
                            ? t({ en: 'No followed readers match that search.', es: 'No hay lectores seguidos que coincidan con esa busqueda.' })
                            : t({ en: 'Not following anyone visible yet.', es: 'Todavia no sigue a nadie visible.' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="profile-layout__side">
              <Reveal>
                <SidebarPanel title={t({ en: 'At a glance', es: 'De un vistazo' })}>
                  <div className="profile-summary-stack">
                    {favoriteBooks.length ? (
                      <div className="mini-shelf">
                        {favoriteBooks.slice(0, 4).map((book) => (
                          <ProfileCoverLink
                            key={book.id}
                            book={book}
                            title={localizeBook(book, locale).title}
                            className="mini-shelf__item"
                          />
                        ))}
                      </div>
                    ) : null}

                    <div className="bullet-stack">
                      <span>
                        <UsersRound size={14} />
                        {followers.length} {t({ en: 'followers', es: 'seguidores' })}
                      </span>
                      <span>
                        <NotebookPen size={14} />
                        {reviews.length} {t({ en: 'reviews', es: 'resenas' })}
                      </span>
                      <span>
                        <BookHeart size={14} />
                        {favoriteBooks.length} {t({ en: 'favorites', es: 'favoritos' })}
                      </span>
                      <span>
                        <Flame size={14} />
                        {profileActivity.length} {t({ en: 'activity items', es: 'items de actividad' })}
                      </span>
                    </div>

                    {recentReview || recentActivity.length ? (
                      <div className="activity-list">
                        {recentReview ? (
                          <article className="activity-list__item">
                            <strong>{recentReview.title[locale]}</strong>
                            <span>{t({ en: 'Latest review', es: 'Ultima resena' })}</span>
                          </article>
                        ) : null}
                        {recentActivity.map((activity) => (
                          <article key={activity.id} className="activity-list__item">
                            <strong>{activity.content[locale]}</strong>
                            <span>{activity.createdAt[locale]}</span>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="profile-inline-empty">
                        {t({ en: 'Nothing recent to surface yet.', es: 'Todavia no hay nada reciente para mostrar.' })}
                      </div>
                    )}
                  </div>
                </SidebarPanel>
              </Reveal>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
