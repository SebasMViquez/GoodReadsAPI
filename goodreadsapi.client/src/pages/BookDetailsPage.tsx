import { Heart, Library, Sparkles, Timer, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BookCard } from '@/components/book/BookCard';
import { EmptyState } from '@/components/common/EmptyState';
import { GenreChip } from '@/components/common/GenreChip';
import { RatingStars } from '@/components/common/RatingStars';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { ReviewCard } from '@/components/review/ReviewCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useLibrary } from '@/context/LibraryContext';
import { getAuthorById, getBookBySlug, getRelatedBooks, getShelfLabel } from '@/services/api/catalog';
import { localizeAuthor, localizeBook } from '@/i18n/localize';
import type { ShelfStatus } from '@/types';

const shelfOptions: ShelfStatus[] = ['want-to-read', 'currently-reading', 'read'];

export function BookDetailsPage() {
  const { locale, t } = useLanguage();
  const { slug = '' } = useParams();
  const { createReview, currentUser, getReviewsForBook, isAuthenticated } = useAuth();
  const book = getBookBySlug(slug);
  const { getShelfForBook, isFavorite, profile, setShelf, toggleFavorite, updateProgress } =
    useLibrary();
  const [reviewForm, setReviewForm] = useState({
    rating: 4,
    title: '',
    excerpt: '',
    body: '',
  });
  const [reviewFeedback, setReviewFeedback] = useState('');

  if (!book) {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <EmptyState
            title={t({
              en: 'This title is not available in the current catalog',
              es: 'Este titulo no esta disponible en el catalogo actual',
            })}
            description={t({
              en: 'The route exists, but the book record could not be found in the catalog source.',
              es: 'La ruta existe, pero no se encontro el registro del libro en la fuente del catalogo.',
            })}
            actionLabel={t({ en: 'Return to discovery', es: 'Volver a descubrir' })}
            actionTo="/explore"
          />
        </div>
      </section>
    );
  }

  const author = getAuthorById(book.authorId);
  const localizedBook = localizeBook(book, locale);
  const localizedAuthor = author ? localizeAuthor(author, locale) : null;
  const reviews = getReviewsForBook(book.id);
  const relatedBooks = getRelatedBooks(book.id);
  const currentShelf = getShelfForBook(book.id);
  const currentProgress =
    profile?.currentlyReading.find((entry) => entry.bookId === book.id)?.progress ?? 0;
  const hasOwnReview = Boolean(
    currentUser && reviews.some((review) => review.userId === currentUser.id),
  );

  const handleSubmitReview = async () => {
    const result = await createReview({
      bookId: book.id,
      rating: reviewForm.rating,
      title: reviewForm.title,
      excerpt: reviewForm.excerpt,
      body: reviewForm.body,
    });

    if (!result.success) {
      setReviewFeedback(result.error ?? '');
      return;
    }

    setReviewFeedback(
      t({
        en: 'Review published. It is already visible in your profile and the community feed.',
        es: 'Resena publicada. Ya es visible en tu perfil y en el feed de comunidad.',
      }),
    );
    setReviewForm({
      rating: 4,
      title: '',
      excerpt: '',
      body: '',
    });
  };

  return (
    <>
      <section className="section page-top-spacing">
        <div className="container">
          <div className="book-hero">
            <Reveal>
              <div className="book-hero__cover">
                <img src={book.cover} alt={`${localizedBook.title} cover`} />
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="book-hero__content">
                <span className="eyebrow">{t({ en: 'Book details', es: 'Detalles del libro' })}</span>
                <h1>{localizedBook.title}</h1>
                <p className="book-hero__subtitle">{localizedBook.subtitle}</p>
                <p className="book-hero__author">
                  {t({ en: 'by', es: 'por' })} {author?.name}
                </p>
                <blockquote>"{localizedBook.quote}"</blockquote>
                <p className="book-hero__description">{localizedBook.description}</p>

                <div className="book-hero__genres">
                  {localizedBook.genres.map((genre) => (
                    <GenreChip key={genre} label={genre} />
                  ))}
                </div>

                <div className="shelf-selector">
                  {shelfOptions.map((shelf) => (
                    <button
                      key={shelf}
                      type="button"
                      className={
                        currentShelf === shelf
                          ? 'shelf-selector__button shelf-selector__button--active'
                          : 'shelf-selector__button'
                      }
                      onClick={() => setShelf(book.id, shelf)}
                      disabled={!isAuthenticated}
                    >
                      {getShelfLabel(shelf, locale)}
                    </button>
                  ))}

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

                {!isAuthenticated ? (
                  <div className="inline-note">
                    <span>
                      {t({
                        en: 'Login to save this book, favorite it, track your progress, and publish your own review.',
                        es: 'Inicia sesion para guardar este libro, marcarlo como favorito, seguir tu progreso y publicar tu propia resena.',
                      })}
                    </span>
                    <Link to="/login">{t({ en: 'Login', es: 'Entrar' })}</Link>
                  </div>
                ) : null}

                {currentShelf === 'currently-reading' ? (
                  <div className="reading-slider">
                    <div className="reading-slider__label">
                      <span>{t({ en: 'Reading progress', es: 'Progreso de lectura' })}</span>
                      <strong>{currentProgress}%</strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={currentProgress}
                      onChange={(event) => updateProgress(book.id, Number(event.target.value))}
                    />
                  </div>
                ) : null}

                <div className="meta-stat-row">
                  <div className="meta-stat-row__item">
                    <Library size={16} />
                    <div>
                      <strong>{localizedBook.format}</strong>
                      <span>
                        {book.pageCount} {t({ en: 'pages', es: 'paginas' })}
                      </span>
                    </div>
                  </div>
                  <div className="meta-stat-row__item">
                    <Timer size={16} />
                    <div>
                      <strong>{book.year}</strong>
                      <span>{localizedBook.mood}</span>
                    </div>
                  </div>
                  <div className="meta-stat-row__item">
                    <Users size={16} />
                    <div>
                      <strong>
                        {book.friendsReading} {t({ en: 'friends', es: 'amigos' })}
                      </strong>
                      <span>{localizedBook.shelves}</span>
                    </div>
                  </div>
                  <div className="meta-stat-row__item">
                    <Sparkles size={16} />
                    <div>
                      <strong>{book.rating.toFixed(1)}</strong>
                      <span>{localizedBook.ratingCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container detail-layout">
          <div className="detail-layout__main">
            <Reveal>
              <div className="settings-card">
                <SectionHeader
                  eyebrow={t({ en: 'Write your take', es: 'Escribe tu lectura' })}
                  title={t({
                    en: 'Turn your rating into a review other readers can react to',
                    es: 'Convierte tu rating en una resena a la que otros lectores puedan reaccionar',
                  })}
                  description={t({
                    en: 'This makes every book page feel participatory instead of passive.',
                    es: 'Esto hace que cada pagina de libro se sienta participativa y no pasiva.',
                  })}
                />

                {hasOwnReview ? (
                  <div className="settings-note-card">
                    <Sparkles size={18} />
                    <div>
                      <strong>{t({ en: 'You already reviewed this book', es: 'Ya resenaste este libro' })}</strong>
                      <p>
                        {t({
                          en: 'Your review is already part of the conversation below.',
                          es: 'Tu resena ya forma parte de la conversacion que aparece abajo.',
                        })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="settings-form">
                    <div className="field">
                      <span>{t({ en: 'Your rating', es: 'Tu valoracion' })}</span>
                      <RatingStars
                        rating={reviewForm.rating}
                        showValue
                        interactive
                        size={18}
                        onChange={(rating) => setReviewForm((currentForm) => ({ ...currentForm, rating }))}
                      />
                    </div>

                    <div className="settings-form__grid">
                      <label className="field">
                        <span>{t({ en: 'Review title', es: 'Titulo de la resena' })}</span>
                        <div className="field__control">
                          <input
                            value={reviewForm.title}
                            onChange={(event) =>
                              setReviewForm((currentForm) => ({
                                ...currentForm,
                                title: event.target.value,
                              }))
                            }
                            placeholder={t({
                              en: 'A sharp headline for your take',
                              es: 'Un titular claro para tu lectura',
                            })}
                            disabled={!isAuthenticated}
                          />
                        </div>
                      </label>

                      <label className="field">
                        <span>{t({ en: 'Short excerpt', es: 'Extracto corto' })}</span>
                        <div className="field__control">
                          <input
                            value={reviewForm.excerpt}
                            onChange={(event) =>
                              setReviewForm((currentForm) => ({
                                ...currentForm,
                                excerpt: event.target.value,
                              }))
                            }
                            placeholder={t({
                              en: 'What is the fast takeaway?',
                              es: 'Cual es la idea rapida que te dejo?',
                            })}
                            disabled={!isAuthenticated}
                          />
                        </div>
                      </label>
                    </div>

                    <label className="field">
                      <span>{t({ en: 'Full review', es: 'Resena completa' })}</span>
                      <div className="field__control field__control--textarea">
                        <textarea
                          rows={5}
                          value={reviewForm.body}
                          onChange={(event) =>
                            setReviewForm((currentForm) => ({
                              ...currentForm,
                              body: event.target.value,
                            }))
                          }
                          placeholder={t({
                            en: 'Write what worked, what surprised you, and why it matters.',
                            es: 'Escribe que funciono, que te sorprendio y por que importa.',
                          })}
                          disabled={!isAuthenticated}
                        />
                      </div>
                    </label>

                    {reviewFeedback ? (
                      <p
                        className={
                          reviewFeedback.includes('publicada') || reviewFeedback.includes('published')
                            ? 'form-feedback form-feedback--success'
                            : 'form-feedback form-feedback--error'
                        }
                      >
                        {reviewFeedback}
                      </p>
                    ) : null}

                    <div className="settings-form__actions">
                      <button
                        type="button"
                        className="button button--primary"
                        onClick={() => void handleSubmitReview()}
                        disabled={!isAuthenticated}
                      >
                        {t({ en: 'Publish review', es: 'Publicar resena' })}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>

            <Reveal>
              <SectionHeader
                eyebrow={t({ en: 'Reader reviews', es: 'Resenas de lectores' })}
                title={t({
                  en: 'High-signal impressions that help you decide fast',
                  es: 'Impresiones de alto valor que te ayudan a decidir rapido',
                })}
                description={t({
                  en: 'Reviews are now social objects: people can like them, comment on them, and make each book page feel alive.',
                  es: 'Las resenas ahora son objetos sociales: la gente puede darles like, comentarlas y hacer que cada pagina de libro se sienta viva.',
                })}
              />
            </Reveal>
            <div className="review-grid">
              {reviews.slice(0, 4).map((review, index) => (
                <Reveal key={review.id} delay={index * 0.08}>
                  <ReviewCard review={review} variant={index === 0 ? 'feature' : 'default'} />
                </Reveal>
              ))}
            </div>

            <Reveal>
              <SectionHeader
                eyebrow={t({ en: 'Related recommendations', es: 'Recomendaciones relacionadas' })}
                title={t({
                  en: 'More books with adjacent mood, texture, or genre gravity',
                  es: 'Mas libros con tono, textura o gravedad de genero cercana',
                })}
                description={t({
                  en: 'Connections are built around literary resonance, not just category overlap.',
                  es: 'Las conexiones se construyen por resonancia literaria, no solo por coincidencia de categoria.',
                })}
              />
            </Reveal>
            <div className="book-grid">
              {relatedBooks.map((relatedBook, index) => (
                <Reveal key={relatedBook.id} delay={index * 0.05}>
                  <BookCard book={relatedBook} />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="detail-layout__side">
            <Reveal>
              <SidebarPanel
                title={t({ en: 'About the author', es: 'Sobre la autora o autor' })}
                description={t({
                  en: 'A supporting editorial sidebar keeps context close without overwhelming the main reading flow.',
                  es: 'Una barra editorial de apoyo mantiene el contexto cerca sin sobrecargar el flujo principal de lectura.',
                })}
              >
                <div className="author-panel">
                  <img src={author?.portrait} alt={author?.name} />
                  <div>
                    <h4>{author?.name}</h4>
                    <span>{author?.location}</span>
                  </div>
                  <p>{localizedAuthor?.shortBio}</p>
                  <div className="chip-row">
                    <span className="chip chip--soft">
                      {t({ en: 'Known for', es: 'Conocida/o por' })} {localizedAuthor?.notableWork}
                    </span>
                    <span className="chip chip--accent">{localizedBook.mood}</span>
                  </div>
                </div>
              </SidebarPanel>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
