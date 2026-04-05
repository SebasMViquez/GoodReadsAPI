import { motion } from 'framer-motion';
import { ArrowRight, BookOpenText, Sparkles, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Book } from '@/types';
import { getAuthorById } from '@/services/api/catalog';
import { useLanguage } from '@/context/LanguageContext';
import { localizeBook } from '@/i18n/localize';

interface HeroBannerProps {
  leadBook: Book;
  supportingBooks: Book[];
}

export function HeroBanner({ leadBook, supportingBooks }: HeroBannerProps) {
  const { locale, t } = useLanguage();
  const author = getAuthorById(leadBook.authorId);
  const localizedLeadBook = localizeBook(leadBook, locale);

  return (
    <section className="hero-banner section">
      <div className="container hero-banner__grid">
        <motion.div
          className="hero-banner__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="eyebrow eyebrow--glow">
            {t({ en: 'Premium social reading', es: 'Lectura social premium' })}
          </span>
          <h1>
            {t({ en: 'Discover books through a ', es: 'Descubre libros a traves de una ' })}
            <span>
              {t({
                en: 'luxury editorial interface',
                es: 'interfaz editorial de lujo',
              })}
            </span>{' '}
            {t({
              en: 'designed for readers who notice the details.',
              es: 'disenada para lectores que notan los detalles.',
            })}
          </h1>
          <p>
            {t({
              en: 'Curated shelves, rich community reviews, immersive book pages, and elegant discovery flows built to make every title feel like an event.',
              es: 'Listas curadas, resenas potentes de la comunidad, paginas inmersivas para cada libro y flujos de descubrimiento elegantes para que cada titulo se sienta como un acontecimiento.',
            })}
          </p>

          <div className="hero-banner__actions">
            <Link className="button button--primary" to="/explore">
              {t({ en: 'Explore the catalog', es: 'Explorar el catalogo' })}
              <ArrowRight size={16} />
            </Link>
            <Link className="button button--ghost" to="/library">
              {t({ en: 'Open my library', es: 'Abrir mi biblioteca' })}
            </Link>
          </div>

          <div className="hero-banner__stats">
            <div>
              <Sparkles size={16} />
              <strong>{t({ en: '12 curated arrivals', es: '12 novedades curadas' })}</strong>
              <span>
                {t({
                  en: 'refreshed for this editorial release',
                  es: 'actualizadas para esta seleccion editorial',
                })}
              </span>
            </div>
            <div>
              <UsersRound size={16} />
              <strong>{t({ en: '64k reader moments', es: '64k momentos lectores' })}</strong>
              <span>
                {t({
                  en: 'saved across shelves and lists',
                  es: 'guardados en estantes y listas',
                })}
              </span>
            </div>
            <div>
              <BookOpenText size={16} />
              <strong>{t({ en: '6 immersive views', es: '6 vistas inmersivas' })}</strong>
              <span>
                {t({
                  en: 'from discovery to profile storytelling',
                  es: 'desde descubrimiento hasta perfiles narrativos',
                })}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-banner__visual"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <div
            className="hero-banner__feature"
            style={{ '--hero-accent': leadBook.accent } as React.CSSProperties}
          >
            <div className="hero-banner__feature-copy">
              <span className="chip chip--accent">
                {t({ en: 'Now trending', es: 'En tendencia ahora' })}
              </span>
              <h2>{localizedLeadBook.title}</h2>
              <p>{localizedLeadBook.quote}</p>
              <small>
                {author?.name} | {leadBook.pageCount} {t({ en: 'pages', es: 'paginas' })} |{' '}
                {leadBook.rating.toFixed(1)}
              </small>
            </div>
            <img src={leadBook.cover} alt={`${localizedLeadBook.title} cover`} />
          </div>

          <div className="hero-banner__stack">
            {supportingBooks.map((book) => (
              <LocalizedHeroStackCard key={book.id} book={book} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LocalizedHeroStackCard({ book }: { book: Book }) {
  const { locale } = useLanguage();
  const localizedBook = localizeBook(book, locale);

  return (
    <Link to={`/books/${book.slug}`} className="hero-banner__stack-card">
      <img src={book.cover} alt={`${localizedBook.title} cover`} />
      <div>
        <strong>{localizedBook.title}</strong>
        <span>{localizedBook.genres[0]}</span>
      </div>
    </Link>
  );
}
