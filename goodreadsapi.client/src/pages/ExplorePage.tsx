import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Compass, Flame, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BookCard } from '@/components/book/BookCard';
import { FeaturedBookCard } from '@/components/book/FeaturedBookCard';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterSelect } from '@/components/common/FilterSelect';
import { GenreChip } from '@/components/common/GenreChip';
import { Reveal } from '@/components/common/Reveal';
import { SearchBar } from '@/components/common/SearchBar';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { useLanguage } from '@/context/LanguageContext';
import { books, genreLabels, getAuthorById, trendingBooks } from '@/services/api/catalog';
import { localizeBook } from '@/i18n/localize';
import { getGenreLabel } from '@/i18n/ui';

type SortOption = 'editorial' | 'rating' | 'popular' | 'newest';
type RatingFilter = 'all' | '4.0+' | '4.5+' | '4.7+';
type SignalFilter = 'all' | 'trending' | 'editorial' | 'featured';
type EraFilter = 'all' | 'latest' | 'recent' | 'backlist';

const editorialScore = (book: (typeof books)[number]) =>
  (book.editorPick ? 5 : 0) +
  (book.trending ? 3 : 0) +
  (book.featured ? 2 : 0) +
  book.rating +
  book.friendsReading / 1000;

export function ExplorePage() {
  const { locale, t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('editorial');
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all');
  const [signalFilter, setSignalFilter] = useState<SignalFilter>('all');
  const [formatFilter, setFormatFilter] = useState('all');
  const [eraFilter, setEraFilter] = useState<EraFilter>('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const deferredSearch = useDeferredValue(searchTerm);
  const normalizedSearch = deferredSearch.trim().toLowerCase();

  const formatOptions = useMemo(
    () => Array.from(new Set(books.map((book) => localizeBook(book, locale).format))),
    [locale],
  );

  const resetBookFilters = () => {
    setSearchTerm('');
    setActiveGenre('All');
    setSortBy('editorial');
    setRatingFilter('all');
    setSignalFilter('all');
    setFormatFilter('all');
    setEraFilter('all');
  };

  const hasActiveBookFilters =
    searchTerm.trim().length > 0 ||
    activeGenre !== 'All' ||
    sortBy !== 'editorial' ||
    ratingFilter !== 'all' ||
    signalFilter !== 'all' ||
    formatFilter !== 'all' ||
    eraFilter !== 'all';
  const hasActiveAdvancedFilters = formatFilter !== 'all' || eraFilter !== 'all';
  const activeAdvancedFiltersCount = Number(formatFilter !== 'all') + Number(eraFilter !== 'all');

  const filteredBooks = books
    .filter((book) => {
      const author = getAuthorById(book.authorId);
      const localizedBook = localizeBook(book, locale);
      const haystack =
        `${localizedBook.title} ${localizedBook.subtitle} ${author?.name ?? ''} ${localizedBook.genres.join(' ')}`.toLowerCase();
      const matchesSearch = haystack.includes(normalizedSearch);
      const matchesGenre = activeGenre === 'All' || book.genres.includes(activeGenre);
      const matchesRating =
        ratingFilter === 'all' ||
        (ratingFilter === '4.0+' && book.rating >= 4) ||
        (ratingFilter === '4.5+' && book.rating >= 4.5) ||
        (ratingFilter === '4.7+' && book.rating >= 4.7);
      const matchesSignal =
        signalFilter === 'all' ||
        (signalFilter === 'trending' && Boolean(book.trending)) ||
        (signalFilter === 'editorial' && Boolean(book.editorPick)) ||
        (signalFilter === 'featured' && Boolean(book.featured));
      const matchesFormat = formatFilter === 'all' || localizedBook.format === formatFilter;
      const matchesEra =
        eraFilter === 'all' ||
        (eraFilter === 'latest' && book.year >= 2025) ||
        (eraFilter === 'recent' && book.year >= 2023 && book.year <= 2024) ||
        (eraFilter === 'backlist' && book.year <= 2022);

      return (
        matchesSearch &&
        matchesGenre &&
        matchesRating &&
        matchesSignal &&
        matchesFormat &&
        matchesEra
      );
    })
    .sort((leftBook, rightBook) => {
      if (sortBy === 'rating') {
        return rightBook.rating - leftBook.rating;
      }

      if (sortBy === 'popular') {
        return rightBook.friendsReading - leftBook.friendsReading;
      }

      if (sortBy === 'newest') {
        return rightBook.year - leftBook.year;
      }

      return editorialScore(rightBook) - editorialScore(leftBook);
    });

  const editorialLead = filteredBooks[0] ?? trendingBooks[0];
  const editorialLeadLocalized = editorialLead ? localizeBook(editorialLead, locale) : null;
  const editorialLeadAuthor = editorialLead ? getAuthorById(editorialLead.authorId) : null;
  const editorialStack = useMemo(
    () =>
      (normalizedSearch ? filteredBooks : trendingBooks)
        .filter((book) => book.id !== editorialLead?.id)
        .slice(0, 4),
    [editorialLead?.id, filteredBooks, normalizedSearch],
  );
  const discoverBooks = normalizedSearch ? filteredBooks : filteredBooks.slice(0, 8);
  const editorialSpotlight = editorialStack[0] ?? null;
  const editorialSpotlightLocalized = editorialSpotlight ? localizeBook(editorialSpotlight, locale) : null;
  const editorialSpotlightAuthor = editorialSpotlight ? getAuthorById(editorialSpotlight.authorId) : null;
  const editorSelection = useMemo(
    () => filteredBooks.filter((book) => book.editorPick).slice(0, 4),
    [filteredBooks],
  );
  const quietSelection = useMemo(
    () =>
      filteredBooks
        .filter((book) => !book.trending && !book.featured && book.rating >= 4.5)
        .slice(0, 4),
    [filteredBooks],
  );
  const freshSelection = useMemo(
    () =>
      [...filteredBooks]
        .sort((leftBook, rightBook) => rightBook.year - leftBook.year)
        .slice(0, 4),
    [filteredBooks],
  );
  const trendingSelection = useMemo(
    () => filteredBooks.filter((book) => book.trending).slice(0, 4),
    [filteredBooks],
  );

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
                    en: 'Search titles, authors, or genres',
                    es: 'Busca titulos, autores o generos',
                  })}
                />

                <div className="filter-stack">
                  <div className="filter-bar__controls filter-bar__controls--wrap filter-bar__controls--primary">
                    <FilterSelect
                      compact
                      icon={<SlidersHorizontal size={16} />}
                      ariaLabel={t({ en: 'Sort books', es: 'Ordenar libros' })}
                      value={sortBy}
                      onChange={setSortBy}
                      options={[
                        { value: 'editorial', label: t({ en: 'Editorial', es: 'Editorial' }) },
                        { value: 'rating', label: t({ en: 'Highest rated', es: 'Mejor valorados' }) },
                        { value: 'popular', label: t({ en: 'Most popular', es: 'Mas populares' }) },
                        { value: 'newest', label: t({ en: 'Newest', es: 'Mas nuevos' }) },
                      ]}
                    />

                    <FilterSelect
                      compact
                      ariaLabel={t({ en: 'Filter by rating', es: 'Filtrar por rating' })}
                      value={ratingFilter}
                      onChange={setRatingFilter}
                      options={[
                        { value: 'all', label: t({ en: 'All ratings', es: 'Todos los ratings' }) },
                        { value: '4.0+', label: t({ en: '4.0 and up', es: '4.0 o mas' }) },
                        { value: '4.5+', label: t({ en: '4.5 and up', es: '4.5 o mas' }) },
                        { value: '4.7+', label: t({ en: '4.7 and up', es: '4.7 o mas' }) },
                      ]}
                    />

                    <FilterSelect
                      compact
                      ariaLabel={t({ en: 'Filter by signal', es: 'Filtrar por senal' })}
                      value={signalFilter}
                      onChange={setSignalFilter}
                      options={[
                        { value: 'all', label: t({ en: 'All signals', es: 'Todas las senales' }) },
                        { value: 'trending', label: t({ en: 'Trending', es: 'En tendencia' }) },
                        { value: 'editorial', label: t({ en: 'Editor picks', es: 'Picks editoriales' }) },
                        { value: 'featured', label: t({ en: 'Featured', es: 'Destacados' }) },
                      ]}
                    />

                    <button
                      type="button"
                      className={`button button--ghost filter-toggle-button${showAdvancedFilters || hasActiveAdvancedFilters ? ' filter-toggle-button--active' : ''}`}
                      onClick={() => setShowAdvancedFilters((current) => !current)}
                    >
                      {t({ en: 'More filters', es: 'Mas filtros' })}
                      {activeAdvancedFiltersCount ? (
                        <span className="filter-toggle-button__count">{activeAdvancedFiltersCount}</span>
                      ) : null}
                    </button>

                    {hasActiveBookFilters ? (
                      <button
                        type="button"
                        className="button button--ghost filter-reset-button"
                        onClick={resetBookFilters}
                      >
                        {t({ en: 'Clear', es: 'Limpiar' })}
                      </button>
                    ) : null}
                  </div>

                  {showAdvancedFilters || hasActiveAdvancedFilters ? (
                    <div className="filter-bar__controls filter-bar__controls--wrap filter-bar__controls--secondary">
                      <FilterSelect
                        compact
                        ariaLabel={t({ en: 'Filter by format', es: 'Filtrar por formato' })}
                        value={formatFilter}
                        onChange={setFormatFilter}
                        options={[
                          { value: 'all', label: t({ en: 'All formats', es: 'Todos los formatos' }) },
                          ...formatOptions.map((format) => ({ value: format, label: format })),
                        ]}
                      />

                      <FilterSelect
                        compact
                        ariaLabel={t({ en: 'Filter by year', es: 'Filtrar por ano' })}
                        value={eraFilter}
                        onChange={setEraFilter}
                        options={[
                          { value: 'all', label: t({ en: 'Any year', es: 'Cualquier ano' }) },
                          { value: 'latest', label: t({ en: '2025 and newer', es: '2025 y mas nuevos' }) },
                          { value: 'recent', label: t({ en: '2023 to 2024', es: '2023 a 2024' }) },
                          { value: 'backlist', label: t({ en: '2022 and earlier', es: '2022 y anteriores' }) },
                        ]}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="genre-chip-row">
                <GenreChip
                  label={t({ en: 'All', es: 'Todos' })}
                  active={activeGenre === 'All'}
                  onClick={() => startTransition(() => setActiveGenre('All'))}
                />
                {genreLabels.map((genre) => (
                  <GenreChip
                    key={genre}
                    label={getGenreLabel(genre, locale)}
                    active={activeGenre === genre}
                    onClick={() => startTransition(() => setActiveGenre(genre))}
                  />
                ))}
              </div>
            </Reveal>

            {!normalizedSearch && editorialLead ? (
              <>
                <Reveal delay={0.1}>
                  <div className="discover-editorial">
                    <div className="discover-editorial__lead">
                      <FeaturedBookCard book={editorialLead} variant="editorial" />
                    </div>
                    <div className="discover-editorial__aside">
                      <div className="discover-highlights">
                        <article className="discover-highlight">
                          <span className="eyebrow">{t({ en: 'Trending', es: 'Trending' })}</span>
                          <strong>{t({ en: 'Readers are saving', es: 'Lectores guardando' })}</strong>
                          <span>{filteredBooks.length} {t({ en: 'books in rotation', es: 'libros en rotacion' })}</span>
                        </article>
                        <article className="discover-highlight">
                          <span className="eyebrow">{t({ en: 'Mood', es: 'Mood' })}</span>
                          <strong>{t({ en: 'Editorial', es: 'Editorial' })}</strong>
                          <span>{t({ en: 'Quiet luxury, strong covers, clean pacing', es: 'Lujo sobrio, portadas fuertes, ritmo limpio' })}</span>
                        </article>
                      </div>

                      {editorialSpotlight ? (
                        <article className="discover-editorial-spotlight">
                          <Link
                            className="discover-editorial-spotlight__cover"
                            to={`/books/${editorialSpotlight.slug}`}
                          >
                            <img
                              src={editorialSpotlight.cover}
                              alt={`${editorialSpotlightLocalized?.title ?? editorialSpotlight.slug} cover`}
                            />
                          </Link>

                          <div className="discover-editorial-spotlight__content">
                            <span className="eyebrow">{t({ en: 'Next in lane', es: 'Siguiente en carril' })}</span>
                            <h3>{editorialSpotlightLocalized?.title}</h3>
                            <p className="discover-editorial-spotlight__author">{editorialSpotlightAuthor?.name}</p>
                            <p>{editorialSpotlightLocalized?.shortDescription}</p>
                            <div className="discover-editorial-spotlight__meta">
                              <span>{editorialSpotlight.rating.toFixed(1)} {t({ en: 'rating', es: 'rating' })}</span>
                              <span>{getGenreLabel(editorialSpotlight.genres[0], locale)}</span>
                            </div>
                          </div>
                        </article>
                      ) : null}
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.12}>
                  <div className="discover-editorial-strip">
                    <article className="discover-editorial-mini">
                      <div className="discover-editorial-note__header">
                        <div>
                          <span className="eyebrow">{t({ en: 'Editor note', es: 'Nota editorial' })}</span>
                          <strong>{t({ en: 'Why this one leads', es: 'Por que este lidera' })}</strong>
                        </div>
                        <span>{editorialLead.year}</span>
                      </div>
                      <p>{editorialLeadLocalized?.shortDescription}</p>
                      <div className="discover-editorial-mini__meta">
                        <span>{editorialLeadAuthor?.name}</span>
                        {editorialLead.genres.slice(0, 2).map((genre) => (
                          <span key={genre}>{getGenreLabel(genre, locale)}</span>
                        ))}
                      </div>
                    </article>

                    <article className="discover-editorial-mini discover-editorial-mini--quote">
                      <span className="eyebrow">{t({ en: 'Line to remember', es: 'Linea para recordar' })}</span>
                      <blockquote>{editorialLeadLocalized?.quote}</blockquote>
                      <span className="discover-editorial-mini__attribution">{editorialLeadAuthor?.name}</span>
                    </article>

                    <article className="discover-editorial-mini">
                      <span className="eyebrow">{t({ en: 'Reader signal', es: 'Senal lectora' })}</span>
                      <strong>
                        {editorialLead.friendsReading} {t({ en: 'readers tracking it', es: 'lectores siguiendolo' })}
                      </strong>
                      <p>{editorialLeadLocalized?.mood}</p>
                      <div className="discover-editorial-mini__meta">
                        <span>{editorialLead.rating.toFixed(1)} {t({ en: 'rating', es: 'rating' })}</span>
                        <span>{editorialLeadLocalized?.ratingCount}</span>
                      </div>
                    </article>
                  </div>
                </Reveal>

                <Reveal delay={0.14}>
                  <SectionHeader
                    eyebrow={t({ en: 'Curated lanes', es: 'Carriles curados' })}
                    title={t({
                      en: 'Editorial lanes',
                      es: 'Carriles editoriales',
                    })}
                  />
                </Reveal>

                <div className="discover-module-grid">
                  <Reveal delay={0.16}>
                    <section className="discover-module">
                      <div className="discover-module__header">
                        <div>
                          <span className="eyebrow">{t({ en: 'Editor picks', es: 'Picks editoriales' })}</span>
                          <h3>{t({ en: 'Stronger voices', es: 'Voces fuertes' })}</h3>
                        </div>
                        <span>{editorSelection.length}</span>
                      </div>
                      <div className="book-grid discover-module__grid">
                        {editorSelection.slice(0, 2).map((book, index) => (
                          <Reveal key={book.id} delay={index * 0.04}>
                            <BookCard book={book} />
                          </Reveal>
                        ))}
                      </div>
                    </section>
                  </Reveal>

                  <Reveal delay={0.18}>
                    <section className="discover-module">
                      <div className="discover-module__header">
                        <div>
                          <span className="eyebrow">{t({ en: 'Quiet gems', es: 'Joyas silenciosas' })}</span>
                          <h3>{t({ en: 'Low-noise picks', es: 'Picks sobrios' })}</h3>
                        </div>
                        <span>{quietSelection.length}</span>
                      </div>
                      <div className="book-grid discover-module__grid">
                        {quietSelection.slice(0, 2).map((book, index) => (
                          <Reveal key={book.id} delay={index * 0.04}>
                            <BookCard book={book} />
                          </Reveal>
                        ))}
                      </div>
                    </section>
                  </Reveal>
                </div>

                <Reveal delay={0.2}>
                  <div className="discover-band">
                    <div className="discover-band__copy">
                      <span className="eyebrow">{t({ en: 'Fresh arrivals', es: 'Llegadas recientes' })}</span>
                      <h2>{t({ en: 'Fresh arrivals', es: 'Llegadas recientes' })}</h2>
                    </div>
                    <div className="discover-band__actions">
                      <Link className="button button--ghost" to="/readers">
                        {t({ en: 'Find readers', es: 'Ver lectores' })}
                      </Link>
                    </div>
                  </div>
                </Reveal>

                <div className="book-grid">
                  {freshSelection.map((book, index) => (
                    <Reveal key={book.id} delay={index * 0.04}>
                      <BookCard book={book} />
                    </Reveal>
                  ))}
                </div>
              </>
            ) : null}

            <Reveal delay={0.12}>
              <SectionHeader
                eyebrow={normalizedSearch ? t({ en: 'Results', es: 'Resultados' }) : t({ en: 'Selected for you', es: 'Seleccionados para ti' })}
                title={
                  normalizedSearch
                    ? t({
                        en: `${filteredBooks.length} books`,
                        es: `${filteredBooks.length} libros`,
                      })
                    : t({
                        en: 'Books in motion',
                        es: 'Libros en movimiento',
                      })
                }
              />
            </Reveal>

            {discoverBooks.length ? (
              <div className="book-grid">
                {discoverBooks.map((book, index) => (
                  <Reveal key={book.id} delay={index * 0.03}>
                    <BookCard book={book} />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <EmptyState
                  title={t({
                    en: 'No books match this filter',
                    es: 'Ningun libro coincide con este filtro',
                  })}
                  description={t({
                    en: 'Try another genre or rating threshold.',
                    es: 'Prueba otro genero o umbral de rating.',
                  })}
                  actionLabel={t({ en: 'Return home', es: 'Volver al inicio' })}
                  actionTo="/"
                />
              </Reveal>
            )}
          </div>

          <div className="explore-layout__side">
            <Reveal>
              <SidebarPanel title={t({ en: 'Right now', es: 'Ahora mismo' })}>
                <div className="discover-side-stack">
                  <article className="discover-side-stat">
                    <Sparkles size={16} />
                    <div className="discover-side-stat__body">
                      <div className="discover-side-stat__top">
                        <strong>{t({ en: 'Editor picks', es: 'Picks editoriales' })}</strong>
                        <span className="discover-side-stat__meta">
                          {filteredBooks.filter((book) => book.editorPick).length}{' '}
                          {t({ en: 'featured titles', es: 'titulos destacados' })}
                        </span>
                      </div>
                      <span className="discover-side-stat__copy">
                        {t({
                          en: 'Curated selections with the strongest editorial signal.',
                          es: 'Selecciones curadas con la senal editorial mas fuerte.',
                        })}
                      </span>
                    </div>
                  </article>
                  <article className="discover-side-stat">
                    <Flame size={16} />
                    <div className="discover-side-stat__body">
                      <div className="discover-side-stat__top">
                        <strong>{t({ en: 'Trending now', es: 'En tendencia' })}</strong>
                        <span className="discover-side-stat__meta">
                          {trendingBooks.length} {t({ en: 'books', es: 'libros' })}
                        </span>
                      </div>
                      <span className="discover-side-stat__copy">
                        {t({
                          en: 'Moving fast across shelves and saves.',
                          es: 'Moviendose rapido entre estantes y guardados.',
                        })}
                      </span>
                    </div>
                  </article>
                  <article className="discover-side-stat">
                    <Compass size={16} />
                    <div>
                      <strong>{t({ en: 'Genres in play', es: 'Generos activos' })}</strong>
                      <span>{genreLabels.slice(0, 4).map((genre) => getGenreLabel(genre, locale)).join(' · ')}</span>
                    </div>
                  </article>
                  <article className="discover-side-stat">
                    <Sparkles size={16} />
                    <div>
                      <strong>{t({ en: 'Reader motion', es: 'Movimiento lector' })}</strong>
                      <span>{trendingSelection.length} {t({ en: 'titles pulling attention', es: 'titulos atrayendo atencion' })}</span>
                    </div>
                  </article>
                </div>
              </SidebarPanel>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
