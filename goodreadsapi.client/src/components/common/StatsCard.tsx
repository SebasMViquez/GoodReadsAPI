import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}

export function StatsCard({ icon: Icon, label, value, description }: StatsCardProps) {
  return (
    <article className="stats-card">
      <div className="stats-card__icon">
        <Icon size={18} />
      </div>
      <span className="stats-card__label">{label}</span>
      <strong className="stats-card__value">{value}</strong>
      <p className="stats-card__description">{description}</p>
    </article>
  );
}
