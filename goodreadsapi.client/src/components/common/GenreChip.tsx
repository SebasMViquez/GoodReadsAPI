import clsx from 'clsx';

interface GenreChipProps {
  label: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

export function GenreChip({ label, active, count, onClick }: GenreChipProps) {
  const content = (
    <>
      <span>{label}</span>
      {typeof count === 'number' ? <span className="genre-chip__count">{count}</span> : null}
    </>
  );

  if (!onClick) {
    return <span className={clsx('genre-chip', active && 'genre-chip--active')}>{content}</span>;
  }

  return (
    <button
      type="button"
      className={clsx('genre-chip', active && 'genre-chip--active')}
      onClick={onClick}
    >
      {content}
    </button>
  );
}
