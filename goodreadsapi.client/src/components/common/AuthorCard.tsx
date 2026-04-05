import { BookText, MapPin } from 'lucide-react';
import { books } from '@/services/api/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { localizeAuthor, localizeBook } from '@/i18n/localize';
import type { Author } from '@/types';

interface AuthorCardProps {
  author: Author;
}

export function AuthorCard({ author }: AuthorCardProps) {
  const { locale, t } = useLanguage();
  const localizedAuthor = localizeAuthor(author, locale);
  const authorBooks = books
    .filter((book) => book.authorId === author.id)
    .slice(0, 2)
    .map((book) => localizeBook(book, locale));

  return (
    <article className="author-card">
      <div className="author-card__header">
        <img src={author.portrait} alt={author.name} />
        <div>
          <span className="eyebrow">{t({ en: 'Author', es: 'Autor' })}</span>
          <h3>{author.name}</h3>
          <span className="author-card__meta">
            <MapPin size={14} />
            {author.location}
          </span>
        </div>
      </div>

      <p>{localizedAuthor.shortBio}</p>

      <div className="author-card__footer">
        <span className="chip chip--accent">
          <BookText size={14} />
          {t({ en: 'Known for', es: 'Conocido por' })} {localizedAuthor.notableWork}
        </span>
        <div className="chip-row">
          {authorBooks.map((book) => (
            <span key={book.id} className="chip chip--soft">
              {book.title}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
