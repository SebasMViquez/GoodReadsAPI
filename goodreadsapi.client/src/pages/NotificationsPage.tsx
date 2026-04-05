import { useMemo, useState } from 'react';
import { Bell, Check, Heart, Mail, Sparkles, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { ListTabs } from '@/components/common/ListTabs';
import { Reveal } from '@/components/common/Reveal';
import { SectionHeader } from '@/components/common/SectionHeader';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

type NotificationTab = 'all' | 'messages' | 'social' | 'requests';

const formatRelativeTime = (value: string, locale: 'es' | 'en') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const getNotificationTab = (type: string): NotificationTab => {
  if (type === 'message') {
    return 'messages';
  }

  if (type === 'follow-request') {
    return 'requests';
  }

  return 'social';
};

export function NotificationsPage() {
  const { locale, t } = useLanguage();
  const {
    currentUser,
    followRequests,
    getUserById,
    markNotificationsAsRead,
    notifications,
    respondToFollowRequest,
  } = useAuth();
  const [tab, setTab] = useState<NotificationTab>('all');

  const visibleNotifications = useMemo(
    () =>
      notifications
        .filter((notification) => notification.userId === currentUser?.id)
        .sort(
          (leftNotification, rightNotification) =>
            new Date(rightNotification.createdAt).getTime() -
            new Date(leftNotification.createdAt).getTime(),
        ),
    [currentUser?.id, notifications],
  );

  const unreadCount = visibleNotifications.filter((notification) => !notification.read).length;
  const messageCount = visibleNotifications.filter((notification) => notification.type === 'message').length;
  const pendingRequestCount = followRequests.filter(
    (request) => request.targetUserId === currentUser?.id && request.status === 'pending',
  ).length;

  const filteredNotifications = useMemo(
    () =>
      tab === 'all'
        ? visibleNotifications
        : visibleNotifications.filter((notification) => getNotificationTab(notification.type) === tab),
    [tab, visibleNotifications],
  );

  const unreadNotifications = filteredNotifications.filter((notification) => !notification.read);
  const earlierNotifications = filteredNotifications.filter((notification) => notification.read);

  if (!currentUser) {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <EmptyState
            title={t({
              en: 'Notifications need a signed-in reader',
              es: 'Las notificaciones necesitan un lector con sesion iniciada',
            })}
            description={t({
              en: 'Log in to see messages, follows, requests, and social activity.',
              es: 'Inicia sesion para ver mensajes, follows, solicitudes y actividad social.',
            })}
            actionLabel={t({ en: 'Go to login', es: 'Ir a entrar' })}
            actionTo="/login"
          />
        </div>
      </section>
    );
  }

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <Reveal>
          <div className="notifications-header">
            <div className="notifications-header__copy">
              <span className="eyebrow">{t({ en: 'Inbox', es: 'Bandeja' })}</span>
              <h1>{t({ en: 'Notifications', es: 'Notificaciones' })}</h1>
              <p>
                {t({
                  en: 'Review messages, follow activity, approvals, and reading signals in one place.',
                  es: 'Revisa mensajes, actividad de follows, aprobaciones y senales de lectura en un solo lugar.',
                })}
              </p>
            </div>
            <div className="notifications-header__actions">
              <button
                type="button"
                className="button button--ghost"
                onClick={markNotificationsAsRead}
                disabled={!unreadCount}
              >
                {t({ en: 'Mark all as read', es: 'Marcar todo como leido' })}
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.04}>
          <div className="notification-summary-strip">
            <article className="notification-summary-card">
              <span className="notification-summary-card__label">
                <Bell size={14} />
                {t({ en: 'Unread', es: 'Sin leer' })}
              </span>
              <strong>{unreadCount}</strong>
              <p>
                {t({
                  en: 'Items that still need a decision or a reply.',
                  es: 'Items que todavia necesitan una decision o respuesta.',
                })}
              </p>
            </article>
            <article className="notification-summary-card">
              <span className="notification-summary-card__label">
                <Mail size={14} />
                {t({ en: 'Messages', es: 'Mensajes' })}
              </span>
              <strong>{messageCount}</strong>
              <p>
                {t({
                  en: 'Direct conversations and fresh replies.',
                  es: 'Conversaciones directas y respuestas nuevas.',
                })}
              </p>
            </article>
            <article className="notification-summary-card">
              <span className="notification-summary-card__label">
                <UserPlus size={14} />
                {t({ en: 'Requests', es: 'Solicitudes' })}
              </span>
              <strong>{pendingRequestCount}</strong>
              <p>
                {t({
                  en: 'Follow approvals waiting for review.',
                  es: 'Aprobaciones de seguimiento esperando revision.',
                })}
              </p>
            </article>
          </div>
        </Reveal>

        <div className="community-layout notifications-layout">
          <div className="community-layout__main">
            <Reveal>
              <div className="notifications-tabs">
                <ListTabs
                  items={[
                    { value: 'all', label: t({ en: 'All', es: 'Todo' }), helper: `${visibleNotifications.length}` },
                    { value: 'messages', label: t({ en: 'Messages', es: 'Mensajes' }), helper: `${visibleNotifications.filter((item) => item.type === 'message').length}` },
                    { value: 'social', label: t({ en: 'Social', es: 'Social' }), helper: `${visibleNotifications.filter((item) => getNotificationTab(item.type) === 'social').length}` },
                    { value: 'requests', label: t({ en: 'Requests', es: 'Solicitudes' }), helper: `${visibleNotifications.filter((item) => item.type === 'follow-request').length}` },
                  ]}
                  value={tab}
                  onChange={(value) => setTab(value as NotificationTab)}
                />
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <SectionHeader
                eyebrow={
                  tab === 'all'
                    ? t({ en: 'Feed', es: 'Feed' })
                    : tab === 'messages'
                      ? t({ en: 'Messages', es: 'Mensajes' })
                      : tab === 'requests'
                        ? t({ en: 'Requests', es: 'Solicitudes' })
                        : t({ en: 'Social', es: 'Social' })
                }
                title={
                  tab === 'all'
                    ? t({ en: 'Recent notifications', es: 'Notificaciones recientes' })
                    : tab === 'messages'
                      ? t({ en: 'Messages and direct contact', es: 'Mensajes y contacto directo' })
                      : tab === 'requests'
                        ? t({ en: 'Pending requests', es: 'Solicitudes pendientes' })
                        : t({ en: 'Social signals and approvals', es: 'Senales sociales y aprobaciones' })
                }
              />
            </Reveal>

            {filteredNotifications.length ? (
              <div className="notifications-page__stack">
                {unreadNotifications.length ? (
                  <div className="notifications-page__group">
                    <div className="notifications-page__group-header">
                      <strong>{t({ en: 'New', es: 'Nuevo' })}</strong>
                      <span>{unreadNotifications.length}</span>
                    </div>
                    <div className="notifications-page__list">
                      {unreadNotifications.map((notification, index) => {
                        const actor = notification.actorUserId ? getUserById(notification.actorUserId) : undefined;
                        const matchingRequest = notification.requestId
                          ? followRequests.find((request) => request.id === notification.requestId)
                          : undefined;

                        return (
                          <Reveal key={notification.id} delay={index * 0.03}>
                            <article className="notification-item notification-item--page notification-item--unread">
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
                                    t({
                                      en: 'Open the related profile or thread to see more context.',
                                      es: 'Abre el perfil o hilo relacionado para ver mas contexto.',
                                    })}
                                </p>
                                <span>{formatRelativeTime(notification.createdAt, locale)}</span>

                                {notification.type === 'follow-request' && matchingRequest?.status === 'pending' ? (
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
                                ) : (
                                  <div className="notification-item__actions">
                                    {notification.type === 'message' ? (
                                      <Link className="button button--ghost" to="/messages">
                                        {t({ en: 'Open messages', es: 'Abrir mensajes' })}
                                      </Link>
                                    ) : actor ? (
                                      <Link className="button button--ghost" to={`/profile/${actor.username}`}>
                                        {t({ en: 'Open profile', es: 'Abrir perfil' })}
                                      </Link>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            </article>
                          </Reveal>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {earlierNotifications.length ? (
                  <div className="notifications-page__group">
                    <div className="notifications-page__group-header">
                      <strong>{t({ en: 'Earlier', es: 'Antes' })}</strong>
                      <span>{earlierNotifications.length}</span>
                    </div>
                    <div className="notifications-page__list">
                      {earlierNotifications.map((notification, index) => {
                        const actor = notification.actorUserId ? getUserById(notification.actorUserId) : undefined;
                        const matchingRequest = notification.requestId
                          ? followRequests.find((request) => request.id === notification.requestId)
                          : undefined;

                        return (
                          <Reveal key={notification.id} delay={index * 0.02}>
                            <article className="notification-item notification-item--page">
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
                                    t({
                                      en: 'Open the related profile or thread to see more context.',
                                      es: 'Abre el perfil o hilo relacionado para ver mas contexto.',
                                    })}
                                </p>
                                <span>{formatRelativeTime(notification.createdAt, locale)}</span>

                                {notification.type === 'follow-request' && matchingRequest?.status === 'pending' ? (
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
                                ) : (
                                  <div className="notification-item__actions">
                                    {notification.type === 'message' ? (
                                      <Link className="button button--ghost" to="/messages">
                                        {t({ en: 'Open messages', es: 'Abrir mensajes' })}
                                      </Link>
                                    ) : actor ? (
                                      <Link className="button button--ghost" to={`/profile/${actor.username}`}>
                                        {t({ en: 'Open profile', es: 'Abrir perfil' })}
                                      </Link>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            </article>
                          </Reveal>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <Reveal>
                <EmptyState
                  title={t({
                    en: 'Nothing to surface here yet',
                    es: 'Todavia no hay nada que mostrar aqui',
                  })}
                  description={t({
                    en: 'New follows, messages, and social signals will appear here as they happen.',
                    es: 'Nuevos follows, mensajes y senales sociales apareceran aqui a medida que ocurran.',
                  })}
                  actionLabel={t({ en: 'Open community', es: 'Abrir comunidad' })}
                  actionTo="/community"
                />
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
