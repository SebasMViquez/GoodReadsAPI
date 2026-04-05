import { useEffect, useState } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAuthorById, getShelfLabel } from '@/services/api/catalog';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLibrary } from '@/context/LibraryContext';
import { localizeBook } from '@/i18n/localize';
import type { Book } from '@/types';
import { RatingStars } from '../common/RatingStars';

interface BookCardProps {
  book: Book;
  progress?: number;
}

export function BookCard({ book, progress }: BookCardProps) {
  const { locale, t, ui } = useLanguage();
  const { isAuthenticated } = useAuth();
  const author = getAuthorById(book.authorId);
  const { isFavorite, toggleFavorite, getShelfForBook } = useLibrary();
  const shelf = getShelfForBook(book.id);
  const localizedBook = localizeBook(book, locale);
  const [coverSrc, setCoverSrc] = useState(book.cover);
  const [coverState, setCoverState] = useState<'primary' | 'unavailable'>('primary');

  useEffect(() => {
    setCoverSrc(book.cover);
    setCoverState('primary');
  }, [book.cover]);

  const handleCoverError = () => {
    setCoverSrc('');
    setCoverState('unavailable');
  };

  const handleCoverLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    if (coverState !== 'primary') {
      return;
    }

    const { naturalHeight, naturalWidth } = event.currentTarget;
    const looksInvalidCover =
      naturalHeight < 180 ||
      naturalWidth < 120 ||
      naturalHeight <= naturalWidth;

    if (looksInvalidCover) {
      setCoverSrc('');
      setCoverState('unavailable');
    }
  };

  return (
    <article
      className="book-card"
      style={{ '--book-accent': book.accent } as React.CSSProperties}
    >
      <Link to={`/books/${book.slug}`} className="book-card__cover-link">
        <div className="book-card__cover-wrap">
          {coverState !== 'unavailable' ? (
            <img
              src={coverSrc}
              alt={`${localizedBook.title} cover`}
              className="book-card__cover"
              onLoad={handleCoverLoad}
              onError={handleCoverError}
            />
          ) : (
            <div
              className="book-card__cover book-card__cover--fallback"
              aria-label={`${localizedBook.title} cover unavailable`}
            >
              <span>{localizedBook.title}</span>
            </div>
          )}
          {book.trending ? (
            <span className="book-card__badge">
              <Sparkles size={12} />
              {t(ui.common.trending)}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="book-card__content">
        <div className="book-card__topline">
          <div>
            <span className="book-card__eyebrow">{localizedBook.genres[0]}</span>
            <Link to={`/books/${book.slug}`} className="book-card__title-link">
              <h3>{localizedBook.title}</h3>
            </Link>
            <p className="book-card__author">{author?.name}</p>
          </div>
          <button
            type="button"
            className={isFavorite(book.id) ? 'icon-button icon-button--active' : 'icon-button'}
            onClick={() => toggleFavorite(book.id)}
            aria-label="Toggle favorite"
            disabled={!isAuthenticated}
          >
            <Heart size={16} fill={isFavorite(book.id) ? 'currentColor' : 'none'} />
          </button>
        </div>

        <p className="book-card__description">{localizedBook.shortDescription}</p>

        <div className="book-card__meta">
          <RatingStars rating={book.rating} />
          <span>{localizedBook.ratingCount}</span>
        </div>

        <div className="book-card__tags">
          {localizedBook.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="chip chip--soft">
              {genre}
            </span>
          ))}
          {shelf ? <span className="chip chip--accent">{getShelfLabel(shelf, locale)}</span> : null}
        </div>

        {typeof progress === 'number' ? (
          <div className="progress-block">
            <div className="progress-block__label">
              <span>{t(ui.common.readingProgress)}</span>
              <strong>{progress}%</strong>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
