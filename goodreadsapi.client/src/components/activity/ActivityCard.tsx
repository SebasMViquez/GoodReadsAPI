import { BookOpen, Heart, MessageCircle, Sparkles, Star, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookById } from '@/services/api/catalog';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeActivityItem, localizeBook, localizeUser } from '@/i18n/localize';
import type { FeedActivityItem } from '@/types';

interface ActivityCardProps {
  activity: FeedActivityItem;
  compact?: boolean;
}

const iconMap = {
  review: Star,
  favorite: Heart,
  started: BookOpen,
  finished: Sparkles,
  follow: UserPlus,
  shelf: BookOpen,
} as const;

const formatCommentDate = (value: string, locale: string) =>
  new Date(value).toLocaleString(locale === 'es' ? 'es-GT' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export function ActivityCard({ activity, compact = false }: ActivityCardProps) {
  const { locale, t } = useLanguage();
  const {
    addCommentToActivity,
    currentUser,
    getUserById,
    isAuthenticated,
    toggleLikeActivity,
  } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const actor = getUserById(activity.userId);
  const targetUser = activity.targetUserId ? getUserById(activity.targetUserId) : undefined;
  const book = activity.bookId ? getBookById(activity.bookId) : undefined;
  const localizedActivity = localizeActivityItem(activity, locale);
  const localizedActor = actor ? localizeUser(actor, locale) : null;
  const localizedBook = book ? localizeBook(book, locale) : null;
  const ActivityIcon = iconMap[activity.type] ?? Sparkles;
  const hasLiked = Boolean(currentUser && (activity.likedBy ?? []).includes(currentUser.id));

  if (!actor) {
    return null;
  }

  const handleCommentSubmit = () => {
    if (!commentValue.trim()) {
      return;
    }

    addCommentToActivity(activity.id, commentValue);
    setCommentValue('');
    setIsCommentsOpen(true);
  };

  return (
    <article className={compact ? 'activity-card activity-card--compact' : 'activity-card'}>
      <div className="activity-card__header">
        <Link to={`/profile/${actor.username}`} className="activity-card__actor">
          <img src={actor.avatar} alt={actor.name} />
          <div>
            <strong>{actor.name}</strong>
            <span>{localizedActor?.role}</span>
          </div>
        </Link>
        <span className="activity-card__badge">
          <ActivityIcon size={14} />
          {localizedActivity.createdAt}
        </span>
      </div>

      <div className="activity-card__body">
        <div className="activity-card__copy">
          <span className="eyebrow">{t({ en: 'Social feed', es: 'Feed social' })}</span>
          <h3>{localizedActivity.content}</h3>
          {targetUser ? (
            <p>
              {t({ en: 'Now connected with', es: 'Ahora conectado con' })}{' '}
              <Link to={`/profile/${targetUser.username}`}>@{targetUser.username}</Link>
            </p>
          ) : null}
        </div>

        {book && localizedBook ? (
          <Link to={`/books/${book.slug}`} className="activity-card__book">
            <img src={book.cover} alt={localizedBook.title} />
            <div>
              <strong>{localizedBook.title}</strong>
              <span>{actor.name}</span>
            </div>
          </Link>
        ) : null}
      </div>

      <div className="activity-card__footer">
        <div className="activity-card__meta">
          <button
            type="button"
            className={hasLiked ? 'social-button social-button--active' : 'social-button'}
            onClick={() => toggleLikeActivity(activity.id)}
            disabled={!isAuthenticated}
          >
            <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />{' '}
            {(activity.likes ?? 0).toLocaleString()}
          </button>
          <button
            type="button"
            className={isCommentsOpen ? 'social-button social-button--active' : 'social-button'}
            onClick={() => setIsCommentsOpen((currentState) => !currentState)}
          >
            <MessageCircle size={14} /> {(activity.comments ?? 0).toLocaleString()}
          </button>
        </div>
        <Link to={`/profile/${actor.username}`} className="activity-card__link">
          {t({ en: 'View profile', es: 'Ver perfil' })}
        </Link>
      </div>

      {isCommentsOpen ? (
        <div className="social-thread social-thread--activity">
          <div className="social-thread__list">
            {(activity.commentItems ?? []).length ? (
              activity.commentItems?.map((comment) => {
                const commentUser = getUserById(comment.userId);
                return (
                  <article key={comment.id} className="social-comment">
                    <img src={commentUser?.avatar} alt={commentUser?.name} />
                    <div>
                      <strong>{commentUser?.name}</strong>
                      <p>{comment.body}</p>
                      <span>{formatCommentDate(comment.createdAt, locale)}</span>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="social-thread__empty">
                {t({
                  en: 'No comments yet. Add the first reaction to this reading moment.',
                  es: 'Todavia no hay comentarios. Agrega la primera reaccion a este momento lector.',
                })}
              </p>
            )}
          </div>

          <div className="social-thread__composer">
            <textarea
              rows={2}
              value={commentValue}
              onChange={(event) => setCommentValue(event.target.value)}
              placeholder={t({
                en: 'Reply to this activity...',
                es: 'Responde a esta actividad...',
              })}
              disabled={!isAuthenticated}
            />
            <button
              type="button"
              className="button button--ghost"
              onClick={handleCommentSubmit}
              disabled={!isAuthenticated || !commentValue.trim()}
            >
              {t({ en: 'Reply', es: 'Responder' })}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
