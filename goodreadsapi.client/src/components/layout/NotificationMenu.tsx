import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Check, Heart, Mail, Sparkles, UserPlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getBookById } from '@/services/api/catalog';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeBook } from '@/i18n/localize';

const formatRelativeTime = (value: string, locale: 'es' | 'en') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { locale, t } = useLanguage();
  const {
    currentUser,
    followRequests,
    getUserById,
    markNotificationsAsRead,
    notifications,
    respondToFollowRequest,
    unreadNotificationsCount,
  } = useAuth();

  const visibleNotifications = useMemo(
    () =>
      notifications
        .filter((notification) => notification.userId === currentUser?.id)
        .sort(
          (leftNotification, rightNotification) =>
            new Date(rightNotification.createdAt).getTime() -
            new Date(leftNotification.createdAt).getTime(),
        )
        .slice(0, 8),
    [currentUser?.id, notifications],
  );

  useEffect(() => {
    if (open) {
      markNotificationsAsRead();
    }
  }, [markNotificationsAsRead, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const triggerElement = triggerRef.current;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }

      if (event.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        );

        if (!focusableElements.length) {
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = document.activeElement;

        if (event.shiftKey && activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }

        if (!event.shiftKey && activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    window.requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
      triggerElement?.focus();
    };
  }, [open]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="notification-menu" ref={rootRef}>
      <button
        type="button"
        className="navbar__search-link notification-menu__trigger"
        onClick={() => setOpen((currentValue) => !currentValue)}
        aria-label={t({ en: 'Notifications', es: 'Notificaciones' })}
        aria-controls="notification-menu-panel"
        aria-expanded={open}
        ref={triggerRef}
      >
        <Bell size={16} />
        {unreadNotificationsCount ? (
          <span className="notification-menu__badge">{unreadNotificationsCount}</span>
        ) : null}
      </button>

      {open ? (
        <div
          id="notification-menu-panel"
          ref={panelRef}
          className="notification-menu__panel"
          role="dialog"
          aria-modal="false"
          aria-label={t({ en: 'Notifications', es: 'Notificaciones' })}
        >
          <div className="notification-menu__header">
            <div>
              <strong>{t({ en: 'Notifications', es: 'Notificaciones' })}</strong>
              <span>
                {t({
                  en: 'Messages, follows, and social activity',
                  es: 'Mensajes, follows y actividad social',
                })}
              </span>
            </div>
            <button
              type="button"
              className="icon-button"
              onClick={() => setOpen(false)}
              aria-label={t({ en: 'Close notifications', es: 'Cerrar notificaciones' })}
              ref={closeButtonRef}
            >
              <X size={14} />
            </button>
          </div>

          <div className="notification-menu__list">
            {visibleNotifications.length ? (
              visibleNotifications.map((notification) => {
                const actor = notification.actorUserId
                  ? getUserById(notification.actorUserId)
                  : undefined;
                const book = notification.bookId ? getBookById(notification.bookId) : undefined;
                const localizedBook = book ? localizeBook(book, locale) : null;
                const matchingRequest = notification.requestId
                  ? followRequests.find((request) => request.id === notification.requestId)
                  : undefined;

                return (
                  <article key={notification.id} className="notification-item">
                    <div className="notification-item__icon">
                      {notification.type === 'message' ? <Mail size={14} /> : null}
                      {notification.type === 'follow' ? <UserPlus size={14} /> : null}
                      {notification.type === 'follow-request' ? <UserPlus size={14} /> : null}
                      {notification.type === 'activity' ? <Sparkles size={14} /> : null}
                      {notification.type === 'request-approved' ? <Heart size={14} /> : null}
                    </div>

                    <div className="notification-item__copy">
                      <strong>
                        {notification.type === 'message' &&
                          t({
                            en: `${actor?.name ?? 'A reader'} sent you a message`,
                            es: `${actor?.name ?? 'Un lector'} te envio un mensaje`,
                          })}
                        {notification.type === 'follow' &&
                          t({
                            en: `${actor?.name ?? 'A reader'} started following you`,
                            es: `${actor?.name ?? 'Un lector'} empezo a seguirte`,
                          })}
                        {notification.type === 'activity' &&
                          t({
                            en: `${actor?.name ?? 'A reader'} had new activity`,
                            es: `${actor?.name ?? 'Un lector'} tuvo nueva actividad`,
                          })}
                        {notification.type === 'follow-request' &&
                          t({
                            en: `${actor?.name ?? 'A reader'} requested to follow you`,
                            es: `${actor?.name ?? 'Un lector'} solicito seguirte`,
                          })}
                        {notification.type === 'request-approved' &&
                          t({
                            en: `${actor?.name ?? 'A reader'} approved your request`,
                            es: `${actor?.name ?? 'Un lector'} aprobo tu solicitud`,
                          })}
                      </strong>
                      <p>
                        {notification.message ??
                          (localizedBook
                            ? localizedBook.title
                            : t({
                                en: 'Open the related profile to see more',
                                es: 'Abre el perfil relacionado para ver mas',
                              }))}
                      </p>
                      <span>{formatRelativeTime(notification.createdAt, locale)}</span>

                      {notification.type === 'follow-request' &&
                      matchingRequest?.status === 'pending' ? (
                        <div className="notification-item__actions">
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={() => respondToFollowRequest(matchingRequest.id, 'accepted')}
                          >
                            <Check size={14} />
                            {t({ en: 'Accept', es: 'Aceptar' })}
                          </button>
                          <button
                            type="button"
                            className="button button--ghost"
                            onClick={() => respondToFollowRequest(matchingRequest.id, 'declined')}
                          >
                            {t({ en: 'Decline', es: 'Rechazar' })}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="notification-menu__empty">
                <Bell size={16} />
                <span>
                  {t({
                    en: 'No notifications right now.',
                    es: 'No hay notificaciones por ahora.',
                  })}
                </span>
              </div>
            )}
          </div>

          <div className="notification-menu__footer">
            <Link to="/notifications" onClick={() => setOpen(false)}>
              {t({ en: 'Open notifications', es: 'Abrir notificaciones' })}
            </Link>
            <Link to="/messages" onClick={() => setOpen(false)}>
              {t({ en: 'Open messages', es: 'Abrir mensajes' })}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
