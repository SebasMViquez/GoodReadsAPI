import { ArrowUpRight, MessageSquare, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeUser } from '@/i18n/localize';
import type { User } from '@/types';

interface UserCardProps {
  user: User;
  compact?: boolean;
}

export function UserCard({ user, compact = false }: UserCardProps) {
  const { locale, t } = useLanguage();
  const {
    currentUser,
    hasPendingFollowRequest,
    isAuthenticated,
    isFollowingUser,
    toggleFollowUser,
  } = useAuth();
  const localizedUser = localizeUser(user, locale);
  const isCurrentUser = currentUser?.id === user.id;
  const isFollowing = isFollowingUser(user.id);
  const hasPendingRequest = hasPendingFollowRequest(user.id);

  return (
    <article className={compact ? 'user-card user-card--compact' : 'user-card'}>
      <div className="user-card__header">
        <Link to={`/profile/${user.username}`} className="user-card__identity">
          <img src={user.avatar} alt={user.name} />
          <div>
            <strong>{user.name}</strong>
            <span>@{user.username}</span>
          </div>
        </Link>

        {!isCurrentUser ? (
          <button
            type="button"
            className={
              isFollowing || hasPendingRequest
                ? 'button button--ghost user-card__action'
                : 'button button--primary user-card__action'
            }
            onClick={() => toggleFollowUser(user.id)}
            disabled={!isAuthenticated || hasPendingRequest}
          >
            <UserPlus size={14} />
            {!isAuthenticated
              ? t({ en: 'Login', es: 'Entrar' })
              : hasPendingRequest
              ? t({ en: 'Requested', es: 'Solicitado' })
              : isFollowing
              ? t({ en: 'Following', es: 'Siguiendo' })
              : t({ en: 'Follow', es: 'Seguir' })}
          </button>
        ) : (
          <Link className="button button--ghost user-card__action" to={`/profile/${user.username}`}>
            {t({ en: 'My profile', es: 'Mi perfil' })}
            <ArrowUpRight size={14} />
          </Link>
        )}
      </div>

      <div className="user-card__body">
        <span className="user-card__role">{localizedUser.role}</span>
        <p>{localizedUser.bio}</p>
        <div className="chip-row">
          <span className="chip chip--soft">
            {user.profileVisibility === 'private'
              ? t({ en: 'Private profile', es: 'Perfil privado' })
              : t({ en: 'Public profile', es: 'Perfil publico' })}
          </span>
        </div>
      </div>

      <div className="user-card__footer">
        <div className="user-card__stats">
          <span>
            <Users size={14} />
            {localizedUser.followers}
          </span>
          <span>{localizedUser.following}</span>
        </div>
        <div className="chip-row">
          {localizedUser.badges.slice(0, compact ? 1 : 2).map((badge) => (
            <span key={badge} className="chip chip--soft">
              {badge}
            </span>
          ))}
        </div>
      </div>

      {!compact && !isCurrentUser ? (
        <div className="user-card__social-actions">
          <Link
            className="button button--ghost"
            to={isAuthenticated ? `/messages?user=${user.username}` : '/login'}
          >
            <MessageSquare size={14} />
            {t({ en: 'Message', es: 'Mensaje' })}
          </Link>
          <Link className="button button--ghost" to={`/profile/${user.username}`}>
            {t({ en: 'View profile', es: 'Ver perfil' })}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      ) : null}
    </article>
  );
}
