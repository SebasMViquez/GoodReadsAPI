import {
  Compass,
  Flame,
  LibraryBig,
  MessagesSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { BookCard } from '@/components/book/BookCard';
import { FeaturedBookCard } from '@/components/book/FeaturedBookCard';
import { GenreChip } from '@/components/common/GenreChip';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { StatsCard } from '@/components/common/StatsCard';
import { ReviewCard } from '@/components/review/ReviewCard';
import { CallToAction } from '@/components/sections/CallToAction';
import { HeroBanner } from '@/components/sections/HeroBanner';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  books,
  editorPicks,
  featuredBooks,
  genreLabels,
  testimonials,
  trendingBooks,
} from '@/services/api/catalog';
import { getGenreLabel } from '@/i18n/ui';
import { localizeTestimonial, localizeUser } from '@/i18n/localize';

export function HomePage() {
  const { locale, t } = useLanguage();
  const { activityFeed, featuredReviews, getUserById, topReviewers } = useAuth();
  const genreShowcase = genreLabels.filter((genre) =>
    ['Literary Fiction', 'Science Fiction', 'Historical Fiction', 'Fantasy', 'Contemporary', 'Mystery'].includes(
      genre,
    ),
  );

  return (
    <>
      <HeroBanner leadBook={featuredBooks[0]} supportingBooks={featuredBooks.slice(1, 4)} />

      <section className="section home-section home-section--editorial">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow={t({ en: 'Curated arrivals', es: 'Llegadas curadas' })}
              title={t({
                en: 'A home feed composed like an editorial spread',
                es: 'Un home feed compuesto como una pieza editorial',
              })}
              description={t({
                en: 'Premium discovery starts with rhythm: one cinematic spotlight, balanced supporting picks, and shelves that feel considered instead of crowded.',
                es: 'El descubrimiento premium empieza con ritmo: un foco cinematografico, picks de apoyo equilibrados y estantes que se sienten pensados, no saturados.',
              })}
              action={
                <Link className="button button--ghost" to="/explore">
                  {t({ en: 'Browse all books', es: 'Ver todos los libros' })}
                </Link>
              }
            />
          </Reveal>

          <div className="editorial-grid">
            <Reveal className="editorial-grid__feature">
              <FeaturedBookCard book={editorPicks[0]} />
            </Reveal>
            <div className="editorial-grid__stack">
              {trendingBooks.slice(0, 4).map((book, index) => (
                <Reveal key={book.id} delay={index * 0.06}>
                  <BookCard book={book} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow={t({ en: 'Discover by tone', es: 'Descubre por tono' })}
              title={t({
                en: 'Genres styled with personality, not just filters',
                es: 'Generos con personalidad, no solo filtros',
              })}
              description={t({
                en: 'Each shelf can communicate mood and identity, making discovery feel more like browsing a boutique library than scanning a database.',
                es: 'Cada estante puede comunicar tono e identidad, haciendo que descubrir se parezca mas a recorrer una libreria boutique que a escanear una base de datos.',
              })}
            />
          </Reveal>

          <div className="genre-showcase">
            <div className="genre-showcase__cloud">
              {genreShowcase.map((genre, index) => (
                <Reveal key={genre} delay={index * 0.04}>
                  <GenreChip
                    label={getGenreLabel(genre, locale)}
                    count={books.filter((book) => book.genres.includes(genre)).length}
                  />
                </Reveal>
              ))}
            </div>

            <div className="stats-grid">
              <Reveal>
                <StatsCard
                  icon={Compass}
                  label={t({ en: 'Discovery', es: 'Descubrimiento' })}
                  value={t({ en: 'Smart curation', es: 'Curaduria inteligente' })}
                  description={t({
                    en: 'Sections balance algorithmic relevance with an editorial sense of pace and contrast.',
                    es: 'Las secciones equilibran relevancia algoritmica con un sentido editorial de ritmo y contraste.',
                  })}
                />
              </Reveal>
              <Reveal delay={0.08}>
                <StatsCard
                  icon={LibraryBig}
                  label={t({ en: 'Shelving', es: 'Estantes' })}
                  value={t({ en: '3 living lists', es: '3 listas vivas' })}
                  description={t({
                    en: 'Want to Read, Currently Reading, and Read stay visually distinct and easy to scan.',
                    es: 'Quiero leer, Leyendo ahora y Leidos se mantienen visualmente distintos y faciles de recorrer.',
                  })}
                />
              </Reveal>
              <Reveal delay={0.16}>
                <StatsCard
                  icon={MessagesSquare}
                  label={t({ en: 'Community', es: 'Comunidad' })}
                  value={t({ en: 'High-signal reviews', es: 'Resenas de alto valor' })}
                  description={t({
                    en: 'Reader voices are treated like premium content, not secondary metadata.',
                    es: 'La voz de los lectores se trata como contenido premium, no como metadata secundaria.',
                  })}
                />
              </Reveal>
              <Reveal delay={0.24}>
                <StatsCard
                  icon={Flame}
                  label={t({ en: 'Momentum', es: 'Impulso' })}
                  value={t({ en: 'Trending now', es: 'En tendencia ahora' })}
                  description={t({
                    en: 'Timely shelves and standout releases add energy without overwhelming the interface.',
                    es: 'Estantes oportunos y lanzamientos destacados suman energia sin saturar la interfaz.',
                  })}
                />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow={t({ en: 'Reader voices', es: 'Voces lectoras' })}
              title={t({
                en: 'Community proof with a more editorial, premium cadence',
                es: 'Prueba social con una cadencia mas editorial y premium',
              })}
              description={t({
                en: 'Testimonials and standout reviews create trust while reinforcing the atmosphere of the product.',
                es: 'Testimonios y resenas destacadas generan confianza mientras refuerzan la atmosfera del producto.',
              })}
            />
          </Reveal>

          <div className="testimonial-grid">
            {testimonials.map((testimonial, index) => {
              const user = getUserById(testimonial.userId);
              const localizedTestimonial = localizeTestimonial(testimonial, locale);

              return (
                <Reveal key={testimonial.id} delay={index * 0.08}>
                  <article className="testimonial-card">
                    <p>"{localizedTestimonial.quote}"</p>
                    <div className="testimonial-card__user">
                      <img src={user?.avatar} alt={user?.name} />
                      <div>
                        <strong>{user?.name}</strong>
                        <span>{localizedTestimonial.label}</span>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <div className="community-showcase">
            <div className="community-showcase__reviews">
              {featuredReviews.slice(0, 3).map((review, index) => (
                <Reveal key={review.id} delay={index * 0.06}>
                  <ReviewCard review={review} variant={index === 0 ? 'feature' : 'default'} />
                </Reveal>
              ))}
            </div>
            <Reveal>
              <aside className="top-reviewers">
                <span className="eyebrow">{t({ en: 'Top reviewers', es: 'Mejores resenistas' })}</span>
                <h3>
                  {t({
                    en: 'Readers who shape the mood of the platform',
                    es: 'Lectores que marcan el tono de la plataforma',
                  })}
                </h3>
                <div className="top-reviewers__list">
                  {topReviewers.map((user) => (
                    <Link key={user.id} to={`/profile/${user.username}`} className="top-reviewers__item">
                      <img src={user.avatar} alt={user.name} />
                      <div>
                        <strong>{user.name}</strong>
                        <span>{localizeUser(user, locale).followers}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="container">
          <Reveal>
            <SectionHeader
              eyebrow={t({ en: 'Social pulse', es: 'Pulso social' })}
              title={t({
                en: 'A live reading feed makes the product feel inhabited',
                es: 'Un feed lector en vivo hace que el producto se sienta habitado',
              })}
              description={t({
                en: 'Reader actions now surface as elegant activity cards, helping the platform feel social and current from the home experience itself.',
                es: 'Las acciones de los lectores ahora aparecen como cards elegantes de actividad, ayudando a que la plataforma se sienta social y actual desde la propia home.',
              })}
              action={
                <Link className="button button--ghost" to="/community">
                  {t({ en: 'Open community feed', es: 'Abrir feed de comunidad' })}
                </Link>
              }
            />
          </Reveal>

          <div className="activity-feed activity-feed--compact">
            {activityFeed.slice(0, 3).map((activity, index) => (
              <Reveal key={activity.id} delay={index * 0.05}>
                <ActivityCard activity={activity} compact />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CallToAction />
    </>
  );
}
