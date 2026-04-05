import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionTo: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
}: EmptyStateProps) {
  const { t, ui } = useLanguage();

  return (
    <div className="empty-state">
      <span className="eyebrow">{t(ui.common.nothingHereYet)}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <Link className="button button--primary" to={actionTo}>
        {actionLabel}
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
