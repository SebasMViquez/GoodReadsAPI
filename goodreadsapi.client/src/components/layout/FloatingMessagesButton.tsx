import { useEffect } from 'react';
import { MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function FloatingMessagesButton() {
  const location = useLocation();
  const { t } = useLanguage();
  const { currentUser, isAuthenticated, unreadMessagesCount } = useAuth();

  const shouldRender =
    isAuthenticated && Boolean(currentUser) && !location.pathname.startsWith('/messages');

  useEffect(() => {
    if (!shouldRender) {
      document.body.classList.remove('body--has-floating-messages');
      return;
    }

    document.body.classList.add('body--has-floating-messages');

    return () => {
      document.body.classList.remove('body--has-floating-messages');
    };
  }, [shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Link
      className="floating-messages-button"
      to="/messages"
      aria-label={t({ en: 'Open messages', es: 'Abrir mensajes' })}
    >
      <MessageSquare size={20} />
      <span className="floating-messages-button__label">
        {t({ en: 'Messages', es: 'Mensajes' })}
      </span>
      {unreadMessagesCount ? (
        <span className="floating-messages-button__badge">{unreadMessagesCount}</span>
      ) : null}
    </Link>
  );
}
