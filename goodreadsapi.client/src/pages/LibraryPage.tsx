import { useMemo, useState } from 'react';
import { BarChart3, BookMarked, Heart, Sparkles } from 'lucide-react';
import { BookCard } from '@/components/book/BookCard';
import { EmptyState } from '@/components/common/EmptyState';
import { FilterSelect } from '@/components/common/FilterSelect';
import { ListTabs } from '@/components/common/ListTabs';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { StatsCard } from '@/components/common/StatsCard';
import { useLanguage } from '@/context/LanguageContext';
import { useLibrary } from '@/context/LibraryContext';
import { getAuthorById, getBooksByIds, getBooksFromProgress } from '@/services/api/catalog';
import { localizeBook } from '@/i18n/localize';
import type { ShelfStatus } from '@/types';

type SortMode = 'curated' | 'title' | 'rating' | 'year';

export function LibraryPage() {
  const { locale, t } = useLanguage();
  const { favorites, profile } = useLibrary();
  const [activeTab, setActiveTab] = useState<ShelfStatus>('currently-reading');
  const [sortMode, setSortMode] = useState<SortMode>('curated');

  const items =
    profile
      ? activeTab === 'currently-reading'
        ? getBooksFromProgress(profile.currentlyReading)
        : getBooksByIds(activeTab === 'want-to-read' ? profile.wantToRead : profile.read)
      : [];

  const sortedItems = [...items].sort((leftBook, rightBook) => {
    if (sortMode === 'title') {
      return localizeBook(leftBook, locale).title.localeCompare(localizeBook(rightBook, locale).title);
    }

    if (sortMode === 'rating') {
      return rightBook.rating - leftBook.rating;
    }

    if (sortMode === 'year') {
      return rightBook.year - leftBook.year;
    }

    return 0;
  });

  const currentRead = profile ? getBooksFromProgress(profile.currentlyReading)[0] : undefined;
  const nextRead = profile ? getBooksByIds(profile.wantToRead)[0] : undefined;
  const completedHighlight = useMemo(
    () => (profile ? getBooksByIds(profile.read).slice(0, 3) : []),
    [profile],
  );
  const highlightCount = Number(Boolean(currentRead)) + Number(Boolean(nextRead));
  const currentReadAuthor = currentRead ? getAuthorById(currentRead.authorId) : null;
  const nextReadAuthor = nextRead ? getAuthorById(nextRead.authorId) : null;

  if (!profile) {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <EmptyState
            title={t({
              en: 'Login to open your private library',
              es: 'Inicia sesion para abrir tu biblioteca privada',
            })}
            description={t({
              en: 'Your shelves, favorites, and reading progress live behind your active session.',
              es: 'Tus estantes, favoritos y progreso viven detras de tu sesion activa.',
            })}
            actionLabel={t({ en: 'Go to login', es: 'Ir a entrar' })}
            actionTo="/login"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <div className={`library-highlights${highlightCount <= 1 ? ' library-highlights--single' : ''}`}>
          {currentRead ? (
            <Reveal delay={0.04}>
              <article className="library-highlight-card">
                <img src={currentRead.cover} alt={localizeBook(currentRead, locale).title} />
                <div className="library-highlight-card__copy">
                  <div className="library-highlight-card__summary">
                    <span className="eyebrow">{t({ en: 'Reading now', es: 'Leyendo ahora' })}</span>
                    <strong>{localizeBook(currentRead, locale).title}</strong>
                    <p>{currentReadAuthor?.name}</p>
                  </div>
                  <div className="library-highlight-card__progress">
                    <div className="progress-block__label">
                      <span>{t({ en: 'Progress', es: 'Progreso' })}</span>
                      <strong>{currentRead.progress}%</strong>
                    </div>
                    <div className="progress-bar">
                      <span style={{ width: `${currentRead.progress}%` }} />
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ) : null}

          {nextRead ? (
            <Reveal delay={0.08}>
              <article className="library-highlight-card">
                <img src={nextRead.cover} alt={localizeBook(nextRead, locale).title} />
                <div className="library-highlight-card__copy">
                  <div className="library-highlight-card__summary">
                    <span className="eyebrow">{t({ en: 'Next up', es: 'Siguiente' })}</span>
                    <strong>{localizeBook(nextRead, locale).title}</strong>
                    <p>{nextReadAuthor?.name}</p>
                  </div>
                  <p className="library-highlight-card__teaser">{localizeBook(nextRead, locale).shortDescription}</p>
                </div>
              </article>
            </Reveal>
          ) : null}
        </div>

        <div className="library-layout">
          <div className="library-layout__main">
            <Reveal className="library-shelf-tabs">
              <ListTabs
                items={[
                  { value: 'want-to-read', label: t({ en: 'Want to Read', es: 'Quiero leer' }), helper: `${profile.wantToRead.length}` },
                  { value: 'currently-reading', label: t({ en: 'Currently Reading', es: 'Leyendo ahora' }), helper: `${profile.currentlyReading.length}` },
                  { value: 'read', label: t({ en: 'Read', es: 'Leidos' }), helper: `${profile.read.length}` },
                ]}
                value={activeTab}
                onChange={setActiveTab}
              />
            </Reveal>

            <Reveal delay={0.06}>
              <div className="filter-bar filter-bar--compact library-filter-bar">
                <SectionHeader
                  eyebrow={t({ en: 'Library', es: 'Biblioteca' })}
                  title={
                    activeTab === 'currently-reading'
                      ? t({ en: 'Reading now', es: 'Leyendo ahora' })
                      : activeTab === 'want-to-read'
                        ? t({ en: 'Want to read', es: 'Quiero leer' })
                        : t({ en: 'Read', es: 'Leidos' })
                  }
                />
                <FilterSelect
                  compact
                  ariaLabel={t({ en: 'Sort library books', es: 'Ordenar libros de biblioteca' })}
                  value={sortMode}
                  onChange={setSortMode}
                  options={[
                    { value: 'curated', label: t({ en: 'Curated', es: 'Curado' }) },
                    { value: 'title', label: t({ en: 'Title', es: 'Titulo' }) },
                    { value: 'rating', label: t({ en: 'Rating', es: 'Rating' }) },
                    { value: 'year', label: t({ en: 'Year', es: 'Ano' }) },
                  ]}
                />
              </div>
            </Reveal>

            {sortedItems.length ? (
              <div className="book-grid book-grid--library">
                {sortedItems.map((book, index) => (
                  <Reveal key={book.id} delay={index * 0.04}>
                    <BookCard
                      book={book}
                      progress={'progress' in book && typeof book.progress === 'number' ? book.progress : undefined}
                    />
                  </Reveal>
                ))}
              </div>
            ) : (
              <Reveal>
                <EmptyState
                  title={t({ en: 'This shelf is empty', es: 'Este estante esta vacio' })}
                  description={t({ en: 'Start building it from Discover.', es: 'Empieza a construirlo desde Descubrir.' })}
                  actionLabel={t({ en: 'Explore books', es: 'Explorar libros' })}
                  actionTo="/explore"
                />
              </Reveal>
            )}
          </div>

          <div className="library-layout__side">
            <Reveal>
              <SidebarPanel title={t({ en: 'At a glance', es: 'De un vistazo' })}>
                <div className="stats-grid library-stats-grid">
                  <StatsCard
                    icon={BookMarked}
                    label={t({ en: 'Want to read', es: 'Quiero leer' })}
                    value={`${profile.wantToRead.length}`}
                    description={t({ en: 'Saved for later.', es: 'Guardados para despues.' })}
                  />
                  <StatsCard
                    icon={BarChart3}
                    label={t({ en: 'In progress', es: 'En progreso' })}
                    value={`${profile.currentlyReading.length}`}
                    description={t({ en: 'Active reads.', es: 'Lecturas activas.' })}
                  />
                  <StatsCard
                    icon={Heart}
                    label={t({ en: 'Favorites', es: 'Favoritos' })}
                    value={`${favorites.length}`}
                    description={t({ en: 'Pinned books.', es: 'Libros fijados.' })}
                  />
                  <StatsCard
                    icon={Sparkles}
                    label={t({ en: 'Finished', es: 'Terminados' })}
                    value={`${profile.read.length}`}
                    description={t({ en: 'Completed titles.', es: 'Titulos terminados.' })}
                  />
                </div>
              </SidebarPanel>
            </Reveal>

            {completedHighlight.length ? (
              <Reveal delay={0.08}>
                <SidebarPanel title={t({ en: 'Recently finished', es: 'Recien terminados' })}>
                  <div className="mini-shelf">
                    {completedHighlight.map((book) => (
                      <img key={book.id} src={book.cover} alt={localizeBook(book, locale).title} />
                    ))}
                  </div>
                </SidebarPanel>
              </Reveal>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
