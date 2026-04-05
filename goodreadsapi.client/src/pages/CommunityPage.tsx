import { useMemo, useState } from 'react';
import { Sparkles, TrendingUp, UsersRound } from 'lucide-react';
import { ActivityCard } from '@/components/activity/ActivityCard';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { SidebarPanel } from '@/components/common/SidebarPanel';
import { StatsCard } from '@/components/common/StatsCard';
import { ReviewCard } from '@/components/review/ReviewCard';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeUser } from '@/i18n/localize';

type CommunityView = 'feed' | 'featured' | 'popular' | 'recent';
type FeedScope = 'all' | 'following' | 'reviews' | 'reading' | 'social';

export function CommunityPage() {
  const { locale, t } = useLanguage();
  const { activityFeed, currentUser, featuredReviews, getFollowingForUser, reviews, topReviewers } = useAuth();
  const [view, setView] = useState<CommunityView>('feed');
  const [feedScope, setFeedScope] = useState<FeedScope>('all');
  const followingIds = useMemo(
    () => new Set(currentUser ? getFollowingForUser(currentUser.id).map((user) => user.id) : []),
    [currentUser, getFollowingForUser],
  );

  const visibleReviews = [...reviews].sort((leftReview, rightReview) => {
    if (view === 'popular') {
      return rightReview.likes - leftReview.likes;
    }

    if (view === 'recent') {
      return rightReview.comments - leftReview.comments;
    }

    return Number(Boolean(rightReview.featured)) - Number(Boolean(leftReview.featured));
  });

  const filteredActivity = useMemo(() => {
    if (feedScope === 'all') {
      return activityFeed;
    }

    if (feedScope === 'following') {
      return activityFeed.filter((activity) => followingIds.has(activity.userId));
    }

    if (feedScope === 'reviews') {
      return activityFeed.filter((activity) => activity.type === 'review');
    }

    if (feedScope === 'reading') {
      return activityFeed.filter((activity) =>
        ['started', 'finished', 'shelf', 'favorite'].includes(activity.type),
      );
    }

    return activityFeed.filter((activity) => activity.type === 'follow');
  }, [activityFeed, feedScope, followingIds]);

  const communityViews = [
    {
      value: 'feed' as const,
      label: t({ en: 'Feed', es: 'Feed' }),
      helper: t({ en: 'live', es: 'vivo' }),
    },
    {
      value: 'featured' as const,
      label: t({ en: 'Featured', es: 'Destacadas' }),
      helper: t({ en: 'curated', es: 'curadas' }),
    },
    {
      value: 'popular' as const,
      label: t({ en: 'Popular', es: 'Populares' }),
      helper: t({ en: 'most liked', es: 'mas gustadas' }),
    },
    {
      value: 'recent' as const,
      label: t({ en: 'Recent', es: 'Recientes' }),
      helper: t({ en: 'active', es: 'activas' }),
    },
  ];

  const communityScopes = [
    { value: 'all' as const, label: t({ en: 'All', es: 'Todo' }) },
    { value: 'following' as const, label: t({ en: 'Following', es: 'Siguiendo' }) },
    { value: 'reviews' as const, label: t({ en: 'Reviews', es: 'Resenas' }) },
    { value: 'reading' as const, label: t({ en: 'Reading', es: 'Lectura' }) },
    { value: 'social' as const, label: t({ en: 'Social', es: 'Social' }) },
  ];

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <Reveal>
          <div className="community-hero">
            <div className="community-hero__copy">
              <span className="eyebrow">{t({ en: 'Reviews / Community', es: 'Resenas / Comunidad' })}</span>
              <h1>{t({ en: 'Community in motion.', es: 'Comunidad en movimiento.' })}</h1>
              <p>
                {t({
                  en: 'Follow what readers are reviewing, finishing, saving, and sharing right now.',
                  es: 'Sigue lo que los lectores estan resenando, terminando, guardando y compartiendo ahora mismo.',
                })}
              </p>
              <div className="community-hero__chips">
                <span>
                  <Sparkles size={13} />
                  {t({ en: 'Live feed', es: 'Feed vivo' })}
                </span>
                <span>
                  <UsersRound size={13} />
                  {t({ en: 'Reader voices', es: 'Voces lectoras' })}
                </span>
              </div>
            </div>
            <div className="community-hero__stats">
              <div>
                <strong>{reviews.length}</strong>
                <span>{t({ en: 'reviews', es: 'resenas' })}</span>
              </div>
              <div>
                <strong>{filteredActivity.length}</strong>
                <span>{t({ en: 'signals', es: 'senales' })}</span>
              </div>
              <div>
                <strong>{topReviewers.length}</strong>
                <span>{t({ en: 'top voices', es: 'voces destacadas' })}</span>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="community-layout">
          <div className="community-layout__main">
            <div className="community-tab-stack">
              <Reveal>
                <div className="community-nav" role="tablist" aria-label="Community views">
                  {communityViews.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      role="tab"
                      aria-selected={view === item.value}
                      className={
                        view === item.value
                          ? 'community-nav__item community-nav__item--active'
                          : 'community-nav__item'
                      }
                      onClick={() => setView(item.value)}
                    >
                      <span>{item.label}</span>
                      <small>{item.helper}</small>
                    </button>
                  ))}
                </div>
              </Reveal>

              {view === 'feed' ? (
                <Reveal delay={0.05}>
                  <div className="community-feed-scope">
                    <span className="community-feed-scope__label">
                      {t({ en: 'Filter the live feed', es: 'Filtra el feed vivo' })}
                    </span>
                    <div className="community-scope-pills" role="tablist" aria-label="Feed scope">
                      {communityScopes.map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          role="tab"
                          aria-selected={feedScope === item.value}
                          className={
                            feedScope === item.value
                              ? 'community-scope-pills__item community-scope-pills__item--active'
                              : 'community-scope-pills__item'
                          }
                          onClick={() => setFeedScope(item.value)}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ) : null}
            </div>

            {view === 'feed' ? (
              <>
                <Reveal delay={0.08}>
                  <SectionHeader
                    eyebrow={t({ en: 'Live feed', es: 'Feed vivo' })}
                    title={t({ en: 'What the community is doing now', es: 'Lo que la comunidad esta haciendo ahora' })}
                  />
                </Reveal>

                <div className="activity-feed">
                  {filteredActivity.map((activity, index) => (
                    <Reveal key={activity.id} delay={index * 0.03}>
                      <ActivityCard activity={activity} compact={index > 0} />
                    </Reveal>
                  ))}
                </div>
              </>
            ) : (
              <>
                <Reveal delay={0.08}>
                  <SectionHeader
                    eyebrow={t({ en: 'Reviews', es: 'Resenas' })}
                    title={
                      view === 'featured'
                        ? t({ en: 'Featured reviews', es: 'Resenas destacadas' })
                        : view === 'popular'
                          ? t({ en: 'Most liked reviews', es: 'Resenas con mas likes' })
                          : t({ en: 'Most active review threads', es: 'Hilos de resena mas activos' })
                    }
                  />
                </Reveal>

                <div className="review-grid">
                  {(view === 'featured' ? featuredReviews : visibleReviews).map((review, index) => (
                    <Reveal key={review.id} delay={index * 0.04}>
                      <ReviewCard review={review} variant={index === 0 ? 'feature' : 'default'} />
                    </Reveal>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="community-layout__side">
            <Reveal>
              <SidebarPanel title={t({ en: 'Top voices', es: 'Voces destacadas' })}>
                <div className="stats-grid stats-grid--single">
                  <StatsCard
                    icon={UsersRound}
                    label={t({ en: 'Readers', es: 'Lectores' })}
                    value="64k"
                    description={t({
                      en: 'Readers saving, reviewing, and following each other.',
                      es: 'Lectores guardando, resenando y siguiendose entre si.',
                    })}
                  />
                  <StatsCard
                    icon={TrendingUp}
                    label={t({ en: 'Momentum', es: 'Movimiento' })}
                    value={view === 'feed' ? `${filteredActivity.length}` : `${visibleReviews.length}`}
                    description={t({
                      en: 'The community layer keeps the product feeling current.',
                      es: 'La capa comunitaria mantiene al producto sintiendose actual.',
                    })}
                  />
                </div>

                <div className="top-reviewers__list">
                  {topReviewers.map((user) => (
                    <article key={user.id} className="top-reviewers__item">
                      <img src={user.avatar} alt={user.name} />
                      <div>
                        <strong>{user.name}</strong>
                        <span>{localizeUser(user, locale).role}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </SidebarPanel>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
