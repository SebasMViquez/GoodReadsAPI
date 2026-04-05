import { startTransition, useDeferredValue, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, Search as SearchIcon, Sparkles, UsersRound } from 'lucide-react';
import { BookCard } from '@/components/book/BookCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ListTabs } from '@/components/common/ListTabs';
import { Reveal } from '@/components/common/Reveal';
import { SearchBar } from '@/components/common/SearchBar';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { StatsCard } from '@/components/common/StatsCard';
import { UserCard } from '@/components/common/UserCard';
import { AuthorCard } from '@/components/common/AuthorCard';
import { ReviewCard } from '@/components/review/ReviewCard';
import { useAuth } from '@/context/AuthContext';
import { authors, books, trendingBooks } from '@/services/api/catalog';
import { useLanguage } from '@/context/LanguageContext';
import {
  localizeAuthor,
  localizeBook,
  localizeReview,
  localizeUser,
} from '@/i18n/localize';

type SearchTab = 'books' | 'users' | 'authors' | 'reviews';

const searchSuggestions = [
  'archive',
  'fantasy',
  '@amelia-hart',
  'historical fiction',
  'review',
  'safiya',
];

export function SearchPage() {
  const { locale, t } = useLanguage();
  const { reviews, topReviewers, users } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') ?? '';
  const tab = (searchParams.get('tab') as SearchTab | null) ?? 'books';
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
  const usernameNeedle = normalizedQuery.replace(/^@/, '');
  const searchNeedle = usernameNeedle.length > 0 ? usernameNeedle : normalizedQuery;

  const setQuery = (nextQuery: string) => {
    const nextParams = new URLSearchParams(searchParams);

    if (nextQuery) {
      nextParams.set('q', nextQuery);
    } else {
      nextParams.delete('q');
    }

    setSearchParams(nextParams);
  };

  const setTab = (nextTab: SearchTab) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', nextTab);
    setSearchParams(nextParams);
  };

  const bookResults = useMemo(() => {
    return books.filter((book) => {
      const localizedBook = localizeBook(book, locale);
      const author = authors.find((candidate) => candidate.id === book.authorId);
      const haystack =
        `${localizedBook.title} ${localizedBook.subtitle} ${author?.name ?? ''} ${localizedBook.genres.join(' ')}`.toLowerCase();

      return searchNeedle.length > 0 && haystack.includes(searchNeedle);
    });
  }, [locale, searchNeedle]);

  const userResults = useMemo(() => {
    return users.filter((user) => {
      const localizedUser = localizeUser(user, locale);
      const haystack =
        `${user.username} ${user.name} ${localizedUser.role} ${localizedUser.bio}`.toLowerCase();

      return searchNeedle.length > 0 && haystack.includes(searchNeedle);
    });
  }, [locale, searchNeedle, users]);

  const authorResults = useMemo(() => {
    return authors.filter((author) => {
      const localizedAuthor = localizeAuthor(author, locale);
      const relatedTitles = books
        .filter((book) => book.authorId === author.id)
        .map((book) => localizeBook(book, locale).title)
        .join(' ');
      const haystack =
        `${author.name} ${author.location} ${localizedAuthor.shortBio} ${localizedAuthor.notableWork} ${relatedTitles}`.toLowerCase();

      return searchNeedle.length > 0 && haystack.includes(searchNeedle);
    });
  }, [locale, searchNeedle]);

  const reviewResults = useMemo(() => {
    return reviews.filter((review) => {
      const localizedReview = localizeReview(review, locale);
      const user = users.find((candidate) => candidate.id === review.userId);
      const book = books.find((candidate) => candidate.id === review.bookId);
      const localizedBook = book ? localizeBook(book, locale) : null;
      const haystack =
        `${localizedReview.title} ${localizedReview.excerpt} ${localizedReview.body} ${user?.username ?? ''} ${user?.name ?? ''} ${localizedBook?.title ?? ''}`.toLowerCase();

      return searchNeedle.length > 0 && haystack.includes(searchNeedle);
    });
  }, [locale, reviews, searchNeedle, users]);

  const resultsMap = {
    books: bookResults,
    users: userResults,
    authors: authorResults,
    reviews: reviewResults,
  };

  const activeCount = resultsMap[tab].length;

  const searchSurfacePanel = (
    <SidebarPanel
      title={t({ en: 'Search surface', es: 'Superficie de busqueda' })}
      description={t({
        en: 'This first phase turns search into a cross-entity discovery layer rather than a single catalog field.',
        es: 'Esta primera fase convierte la busqueda en una capa de descubrimiento entre entidades y no en un solo campo de catalogo.',
      })}
    >
      <div className="stats-grid stats-grid--single">
        <StatsCard
          icon={Compass}
          label={t({ en: 'Scope', es: 'Alcance' })}
          value={t({ en: 'Cross-entity', es: 'Multientidad' })}
          description={t({
            en: 'Books, people, authors, and reviews now live in one search flow.',
            es: 'Libros, personas, autores y resenas viven ahora en un solo flujo de busqueda.',
          })}
        />
        <StatsCard
          icon={UsersRound}
          label={t({ en: 'Social', es: 'Social' })}
          value={t({ en: '@username ready', es: '@username listo' })}
          description={t({
            en: 'People can be found directly by their chosen handle.',
            es: 'Las personas pueden encontrarse directamente por su username elegido.',
          })}
        />
        <StatsCard
          icon={Sparkles}
          label={t({ en: 'Experience', es: 'Experiencia' })}
          value={t({ en: 'Premium', es: 'Premium' })}
          description={t({
            en: 'Suggestions and curated modules keep search visually rich even before typing.',
            es: 'Las sugerencias y modulos curados mantienen la busqueda visualmente rica incluso antes de escribir.',
          })}
        />
      </div>

      <div className="search-side-links">
        <Link to="/explore">{t({ en: 'Open discover', es: 'Abrir descubrir' })}</Link>
        <Link to="/community">{t({ en: 'Open community', es: 'Abrir comunidad' })}</Link>
      </div>
    </SidebarPanel>
  );

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <Reveal>
          <div className="page-hero">
            <div>
              <span className="eyebrow">{t({ en: 'Global search', es: 'Busqueda global' })}</span>
              <h1>
                {t({
                  en: 'Search the social reading graph, not just the book catalog.',
                  es: 'Busca en el grafo social de lectura, no solo en el catalogo de libros.',
                })}
              </h1>
              <p>
                {t({
                  en: 'Look up books, people, authors, and review voices from one premium search surface.',
                  es: 'Encuentra libros, personas, autores y voces de reseña desde una sola superficie premium de busqueda.',
                })}
              </p>
            </div>

            <div className="page-hero__stats">
              <div>
                <strong>{books.length}</strong>
                <span>{t({ en: 'books indexed', es: 'libros indexados' })}</span>
              </div>
              <div>
                <strong>{users.length}</strong>
                <span>{t({ en: 'reader profiles', es: 'perfiles lectores' })}</span>
              </div>
              <div>
                <strong>{reviews.length}</strong>
                <span>{t({ en: 'reviews searchable', es: 'resenas buscables' })}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div className="filter-bar filter-bar--stacked search-toolbar">
            <SearchBar
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t({
                en: "Search by title, @username, author, genre, or review topic",
                es: 'Busca por titulo, @username, autor, genero o tema de resena',
              })}
            />

            <ListTabs
              items={[
                { value: 'books', label: t({ en: 'Books', es: 'Libros' }), helper: `${bookResults.length}` },
                { value: 'users', label: t({ en: 'Users', es: 'Usuarios' }), helper: `${userResults.length}` },
                { value: 'authors', label: t({ en: 'Authors', es: 'Autores' }), helper: `${authorResults.length}` },
                { value: 'reviews', label: t({ en: 'Reviews', es: 'Resenas' }), helper: `${reviewResults.length}` },
              ]}
              value={tab}
              onChange={(value) => startTransition(() => setTab(value))}
            />
          </div>
        </Reveal>

        {!normalizedQuery ? (
          <>
            <Reveal delay={0.06}>
              <SectionHeader
                eyebrow={t({ en: 'Suggested searches', es: 'Busquedas sugeridas' })}
                title={t({
                  en: 'Start from books, moods, or people',
                  es: 'Empieza por libros, tonos o personas',
                })}
                description={t({
                  en: 'This search flow is designed to feel like discovery with intent, not a blank utility screen.',
                  es: 'Este flujo de busqueda esta pensado para sentirse como descubrimiento con intencion, no como una pantalla utilitaria vacia.',
                })}
              />
            </Reveal>

            <div className="genre-chip-row genre-chip-row--search">
              {searchSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="genre-chip"
                  onClick={() => setQuery(suggestion)}
                >
                  <SearchIcon size={14} />
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="search-empty-layout">
              <div className="search-empty-layout__main">
                <Reveal>
                  <div className="search-editorial-card">
                    <div className="search-editorial-card__copy">
                      <span className="eyebrow">{t({ en: 'Trending books', es: 'Libros en tendencia' })}</span>
                      <h2>
                        {t({
                          en: 'Hot right now across shelves and reviews',
                          es: 'Lo que mas se mueve ahora entre estantes y resenas',
                        })}
                      </h2>
                      <p>
                        {t({
                          en: 'A premium search entry still needs strong visual guidance when the user has not typed anything yet.',
                          es: 'Una entrada premium a la busqueda tambien necesita una guia visual potente cuando la persona aun no ha escrito nada.',
                        })}
                      </p>
                    </div>

                    <div className="book-grid search-editorial-card__grid">
                      {trendingBooks.slice(0, 4).map((book, index) => (
                        <Reveal key={book.id} delay={index * 0.04}>
                          <BookCard book={book} />
                        </Reveal>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              <div className="search-empty-layout__side">
                <Reveal>
                  <SidebarPanel
                    title={t({ en: 'People to follow', es: 'Personas para seguir' })}
                    description={t({
                      en: 'Search should also lead naturally into social discovery.',
                      es: 'La busqueda tambien debe llevar de forma natural al descubrimiento social.',
                    })}
                  >
                    <div className="suggested-people">
                      {topReviewers.map((user) => (
                        <UserCard key={user.id} user={user} compact />
                      ))}
                    </div>
                  </SidebarPanel>
                </Reveal>

                <Reveal delay={0.08}>{searchSurfacePanel}</Reveal>
              </div>
            </div>
          </>
        ) : (
          <div className="explore-layout">
            <div className="explore-layout__main">
              <Reveal delay={0.06}>
                <SectionHeader
                  eyebrow={t({ en: 'Results', es: 'Resultados' })}
                  title={t({
                    en: `${activeCount} matches in ${tab}`,
                    es: `${activeCount} coincidencias en ${tab === 'books' ? 'libros' : tab === 'users' ? 'usuarios' : tab === 'authors' ? 'autores' : 'resenas'}`,
                  })}
                  description={t({
                    en: 'Search supports books, usernames, author names, and review text so the product feels truly social.',
                    es: 'La busqueda soporta libros, usernames, nombres de autor y texto de resenas para que el producto se sienta realmente social.',
                  })}
                />
              </Reveal>

              {tab === 'books' && (
                bookResults.length ? (
                  <div className="book-grid">
                    {bookResults.map((book, index) => (
                      <Reveal key={book.id} delay={index * 0.03}>
                        <BookCard book={book} />
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={t({
                      en: 'No books matched this search',
                      es: 'Ningun libro coincide con esta busqueda',
                    })}
                    description={t({
                      en: 'Try another title, author, genre, or mood to surface more results.',
                      es: 'Prueba otro titulo, autor, genero o tono para sacar mas resultados.',
                    })}
                    actionLabel={t({ en: 'Go to discover', es: 'Ir a descubrir' })}
                    actionTo="/explore"
                  />
                )
              )}

              {tab === 'users' && (
                userResults.length ? (
                  <div className="user-grid">
                    {userResults.map((user, index) => (
                      <Reveal key={user.id} delay={index * 0.03}>
                        <UserCard user={user} />
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={t({
                      en: 'No users matched this search',
                      es: 'Ningun usuario coincide con esta busqueda',
                    })}
                    description={t({
                      en: 'Try searching by exact @username or a reader name.',
                      es: 'Prueba buscando por @username exacto o por nombre de lector.',
                    })}
                    actionLabel={t({ en: 'Explore community', es: 'Explorar comunidad' })}
                    actionTo="/community"
                  />
                )
              )}

              {tab === 'authors' && (
                authorResults.length ? (
                  <div className="author-grid">
                    {authorResults.map((author, index) => (
                      <Reveal key={author.id} delay={index * 0.03}>
                        <AuthorCard author={author} />
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={t({
                      en: 'No authors matched this search',
                      es: 'Ningun autor coincide con esta busqueda',
                    })}
                    description={t({
                      en: 'Try another author name, title, or notable work.',
                      es: 'Prueba otro nombre de autor, titulo u obra destacada.',
                    })}
                    actionLabel={t({ en: 'See trending books', es: 'Ver libros en tendencia' })}
                    actionTo="/explore"
                  />
                )
              )}

              {tab === 'reviews' && (
                reviewResults.length ? (
                  <div className="review-grid">
                    {reviewResults.map((review, index) => (
                      <Reveal key={review.id} delay={index * 0.03}>
                        <ReviewCard review={review} variant={index === 0 ? 'feature' : 'default'} />
                      </Reveal>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title={t({
                      en: 'No reviews matched this search',
                      es: 'Ninguna resena coincide con esta busqueda',
                    })}
                    description={t({
                      en: 'Try another title, username, or review topic.',
                      es: 'Prueba otro titulo, username o tema de resena.',
                    })}
                    actionLabel={t({ en: 'Go to community', es: 'Ir a comunidad' })}
                    actionTo="/community"
                  />
                )
              )}
            </div>

            <div className="explore-layout__side">
              <Reveal>{searchSurfacePanel}</Reveal>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
