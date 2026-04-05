interface LoadingSkeletonProps {
  variant?: 'book' | 'review' | 'stats';
}

export function LoadingSkeleton({ variant = 'book' }: LoadingSkeletonProps) {
  return <div className={`skeleton skeleton--${variant}`} aria-hidden="true" />;
}
