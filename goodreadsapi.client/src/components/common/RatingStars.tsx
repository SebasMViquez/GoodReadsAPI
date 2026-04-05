import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  showValue?: boolean;
  interactive?: boolean;
  size?: number;
  onChange?: (rating: number) => void;
}

export function RatingStars({
  rating,
  showValue = true,
  interactive = false,
  size = 14,
  onChange,
}: RatingStarsProps) {
  return (
    <div className={interactive ? 'rating-stars rating-stars--interactive' : 'rating-stars'}>
      <div className="rating-stars__icons">
        {Array.from({ length: 5 }).map((_, index) => {
          const active = index < Math.round(rating);

          if (interactive) {
            return (
              <button
                key={index}
                type="button"
                className={active ? 'rating-stars__button rating-stars__button--active' : 'rating-stars__button'}
                onClick={() => onChange?.(index + 1)}
                aria-label={`Rate ${index + 1} stars`}
              >
                <Star
                  size={size}
                  className={active ? 'rating-stars__icon rating-stars__icon--active' : 'rating-stars__icon'}
                  fill={active ? 'currentColor' : 'none'}
                />
              </button>
            );
          }

          return (
            <Star
              key={index}
              size={size}
              className={active ? 'rating-stars__icon rating-stars__icon--active' : 'rating-stars__icon'}
              fill={active ? 'currentColor' : 'none'}
            />
          );
        })}
      </div>
      {showValue ? <span className="rating-stars__value">{rating.toFixed(1)}</span> : null}
    </div>
  );
}
