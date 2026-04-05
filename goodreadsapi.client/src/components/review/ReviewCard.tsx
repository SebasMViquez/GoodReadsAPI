import { Heart, MessageCircle, Quote } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getBookById } from '@/services/api/catalog';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeBook, localizeReview, localizeUser } from '@/i18n/localize';
import type { Review } from '@/types';
import { RatingStars } from '../common/RatingStars';

interface ReviewCardProps {
  review: Review;
  variant?: 'default' | 'feature';
}

const formatCommentDate = (value: string, locale: string) =>
  new Date(value).toLocaleString(locale === 'es' ? 'es-GT' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export function ReviewCard({ review, variant = 'default' }: ReviewCardProps) {
  const { locale, t } = useLanguage();
  const {
    addCommentToReview,
    currentUser,
    getUserById,
    isAuthenticated,
    toggleLikeReview,
  } = useAuth();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentValue, setCommentValue] = useState('');
  const user = getUserById(review.userId);
  const book = getBookById(review.bookId);
  const localizedReview = localizeReview(review, locale);
  const localizedBook = book ? localizeBook(book, locale) : null;
  const localizedUser = user ? localizeUser(user, locale) : null;
  const hasLiked = Boolean(currentUser && (review.likedBy ?? []).includes(currentUser.id));

  const handleCommentSubmit = () => {
    if (!commentValue.trim()) {
      return;
    }

    addCommentToReview(review.id, commentValue);
    setCommentValue('');
    setIsCommentsOpen(true);
  };

  return (
    <article className={variant === 'feature' ? 'review-card review-card--feature' : 'review-card'}>
      <div className="review-card__header">
        <div className="review-card__user">
          <img src={user?.avatar} alt={user?.name} />
          <div>
            <Link to={`/profile/${user?.username}`}>{user?.name}</Link>
            <span>{localizedUser?.role}</span>
          </div>
        </div>
        <RatingStars rating={review.rating} />
      </div>

      <div className="review-card__body">
        <Quote size={18} />
        <h3>{localizedReview.title}</h3>
        <p>{localizedReview.excerpt}</p>
      </div>

      <div className="review-card__footer">
        <div className="review-card__book">
          <img src={book?.cover} alt={localizedBook?.title} />
          <div>
            <span>{localizedBook?.title}</span>
            <small>{localizedReview.createdAt}</small>
          </div>
        </div>
        <div className="review-card__engagement">
          <button
            type="button"
            className={hasLiked ? 'social-button social-button--active' : 'social-button'}
            onClick={() => toggleLikeReview(review.id)}
            disabled={!isAuthenticated}
          >
            <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />{' '}
            {review.likes.toLocaleString()}
          </button>
          <button
            type="button"
            className={isCommentsOpen ? 'social-button social-button--active' : 'social-button'}
            onClick={() => setIsCommentsOpen((currentState) => !currentState)}
          >
            <MessageCircle size={14} /> {review.comments}
          </button>
        </div>
      </div>

      {isCommentsOpen ? (
        <div className="social-thread">
          <div className="social-thread__list">
            {(review.commentItems ?? []).length ? (
              review.commentItems?.map((comment) => {
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
                  en: 'No comments yet. Start the conversation from this review.',
                  es: 'Todavia no hay comentarios. Empieza la conversacion desde esta resena.',
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
                en: 'Add a thoughtful reply...',
                es: 'Agrega una respuesta con criterio...',
              })}
              disabled={!isAuthenticated}
            />
            <button
              type="button"
              className="button button--ghost"
              onClick={handleCommentSubmit}
              disabled={!isAuthenticated || !commentValue.trim()}
            >
              {t({ en: 'Comment', es: 'Comentar' })}
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
