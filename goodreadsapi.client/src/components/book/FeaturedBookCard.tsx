import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { getAuthorById } from '@/services/api/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { localizeBook } from '@/i18n/localize';
import type { Book } from '@/types';
import { RatingStars } from '../common/RatingStars';

interface FeaturedBookCardProps {
  book: Book;
  variant?: 'default' | 'editorial';
}

export function FeaturedBookCard({ book, variant = 'default' }: FeaturedBookCardProps) {
  const { locale, t, ui } = useLanguage();
  const author = getAuthorById(book.authorId);
  const localizedBook = localizeBook(book, locale);
  const isEditorial = variant === 'editorial';

  return (
    <article
      className={clsx('featured-book-card', {
        'featured-book-card--editorial': isEditorial,
      })}
      style={{
        '--feature-accent': book.accent,
        backgroundImage: `linear-gradient(135deg, rgba(7, 10, 16, 0.84), rgba(7, 10, 16, 0.18)), url(${book.backdrop})`,
      } as React.CSSProperties}
    >
      <div className="featured-book-card__content">
        <span className="eyebrow">{t(ui.common.editorPick)}</span>
        <h3>{localizedBook.title}</h3>
        <p className="featured-book-card__author">
          {t({ en: 'by', es: 'por' })} {author?.name}
        </p>
        <p className="featured-book-card__description">{localizedBook.description}</p>
        <div className="featured-book-card__footer">
          <div className="featured-book-card__meta">
            <RatingStars rating={book.rating} />
            <span>
              {book.pageCount} {t({ en: 'pages', es: 'paginas' })}
            </span>
            <span>{localizedBook.shelves}</span>
          </div>
          <Link to={`/books/${book.slug}`} className="button button--primary">
            {t(ui.common.viewDetails)}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {!isEditorial ? (
        <div className="featured-book-card__cover">
          <img src={book.cover} alt={`${localizedBook.title} cover`} />
        </div>
      ) : null}
    </article>
  );
}
