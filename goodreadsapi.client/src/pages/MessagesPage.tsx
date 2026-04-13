import { Bell, MessageSquare, Search, Sparkles, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { Reveal } from '@/components/common/Reveal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const formatTime = (value: string, locale: 'es' | 'en') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const formatDay = (value: string, locale: 'es' | 'en') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));

export function MessagesPage() {
  const { locale, t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversationSearch, setConversationSearch] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [composer, setComposer] = useState('');
  const {
    conversations,
    currentUser,
    getUserById,
    getUserByUsername,
    markConversationAsSeen,
    openConversation,
    sendMessage,
    unreadMessagesCount,
    users,
  } = useAuth();
  const targetUsername = searchParams.get('user');

  const visibleConversations = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    return conversations
      .filter((conversation) => conversation.participantIds.includes(currentUser.id))
      .map((conversation) => {
        const partnerId =
          conversation.participantIds.find((id) => id !== currentUser.id) ?? currentUser.id;
        const partner = getUserById(partnerId);
        const latestMessage = conversation.messages[conversation.messages.length - 1];
        const unreadCount = conversation.messages.filter(
          (message) => message.senderId !== currentUser.id && message.status === 'sent',
        ).length;

        return {
          conversation,
          latestMessage,
          partner,
          unreadCount,
        };
      })
      .filter((item) => Boolean(item.partner))
      .sort(
        (leftItem, rightItem) =>
          new Date(rightItem.conversation.updatedAt).getTime() -
          new Date(leftItem.conversation.updatedAt).getTime(),
      );
  }, [conversations, currentUser, getUserById]);

  const filteredConversations = useMemo(() => {
    const normalizedNeedle = conversationSearch.trim().toLocaleLowerCase(locale);

    if (!normalizedNeedle) {
      return visibleConversations;
    }

    return visibleConversations.filter((item) => {
      const partner = item.partner;

      if (!partner) {
        return false;
      }

      const haystack = `${partner.name} ${partner.username}`.toLocaleLowerCase(locale);
      return haystack.includes(normalizedNeedle);
    });
  }, [conversationSearch, locale, visibleConversations]);

  const activeConversation =
    filteredConversations.find((item) => item.conversation.id === activeConversationId) ??
    visibleConversations.find((item) => item.conversation.id === activeConversationId) ??
    null;

  const quickReplies = useMemo(
    () => [
      t({
        en: 'Loved your latest review. Want to buddy-read next month?',
        es: 'Me encanto tu ultima resena. Te animas a hacer lectura conjunta el proximo mes?',
      }),
      t({
        en: 'Do you have one recommendation with the same mood?',
        es: 'Tienes una recomendacion con ese mismo mood?',
      }),
    ],
    [t],
  );

  const suggestedReaders = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const activePartnerIds = new Set(
      visibleConversations
        .map((item) => item.partner?.id)
        .filter((value): value is string => Boolean(value)),
    );

    return users
      .filter((user) => user.id !== currentUser.id && !activePartnerIds.has(user.id))
      .slice(0, 4);
  }, [currentUser, users, visibleConversations]);

  useEffect(() => {
    if (!currentUser || !targetUsername) {
      return;
    }

    const targetUser = getUserByUsername(targetUsername);

    if (!targetUser || targetUser.id === currentUser.id) {
      return;
    }

    openConversation(targetUser.id);
  }, [currentUser, getUserByUsername, openConversation, targetUsername]);

  useEffect(() => {
    if (!targetUsername) {
      return;
    }

    const targetUser = getUserByUsername(targetUsername);

    if (!targetUser) {
      return;
    }

    const matchingConversation = visibleConversations.find(
      (item) => item.partner?.id === targetUser.id,
    );

    if (matchingConversation) {
      setActiveConversationId(matchingConversation.conversation.id);
    }
  }, [getUserByUsername, targetUsername, visibleConversations]);

  useEffect(() => {
    if (activeConversationId || visibleConversations.length === 0) {
      return;
    }

    setActiveConversationId(visibleConversations[0].conversation.id);
  }, [activeConversationId, visibleConversations]);

  useEffect(() => {
    if (!activeConversation?.conversation.id) {
      return;
    }

    markConversationAsSeen(activeConversation.conversation.id);
  }, [activeConversation?.conversation.id, markConversationAsSeen]);

  if (!currentUser) {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <EmptyState
            title={t({
              en: 'Messages require an active session',
              es: 'Los mensajes requieren una sesion activa',
            })}
            description={t({
              en: 'Sign in to chat with readers, manage requests, and keep conversations synced.',
              es: 'Inicia sesion para chatear con lectores, gestionar solicitudes y mantener conversaciones sincronizadas.',
            })}
            actionLabel={t({ en: 'Go to login', es: 'Ir a entrar' })}
            actionTo="/login"
          />
        </div>
      </section>
    );
  }

  const clearTargetFromQuery = () => {
    if (!targetUsername) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('user');
    setSearchParams(nextParams, { replace: true });
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
    clearTargetFromQuery();
  };

  const sendComposedMessage = () => {
    const trimmed = composer.trim();

    if (!trimmed || !activeConversation?.partner) {
      return;
    }

    sendMessage(activeConversation.partner.id, trimmed);
    setComposer('');
  };

  const sendQuickReply = (value: string) => {
    if (!activeConversation?.partner) {
      return;
    }

    sendMessage(activeConversation.partner.id, value);
  };

  const handleStartConversation = (userId: string) => {
    openConversation(userId);
    const nextConversation = visibleConversations.find((item) => item.partner?.id === userId);

    if (nextConversation) {
      setActiveConversationId(nextConversation.conversation.id);
      return;
    }

    const suggestedUser = users.find((user) => user.id === userId);

    if (suggestedUser) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('user', suggestedUser.username);
      setSearchParams(nextParams, { replace: true });
    }
  };

  return (
    <section className="section page-top-spacing">
      <div className="container">
        <div className="messages-shell">
          <Reveal className="messages-shell__sidebar">
            <div className="messages-shell__sidebar-top">
              <div className="messages-shell__toolbar">
                <div className="messages-shell__intro">
                  <span className="eyebrow">{t({ en: 'Inbox', es: 'Bandeja' })}</span>
                  <h1>{t({ en: 'Messages', es: 'Mensajes' })}</h1>
                  <p>
                    {t({
                      en: 'Direct conversation space for readers, follow-up threads, and collaborative curation.',
                      es: 'Espacio de conversacion directa para lectores, seguimiento de hilos y curaduria colaborativa.',
                    })}
                  </p>
                </div>

                <div className="messages-shell__hero-chips">
                  <span>
                    <Bell size={13} />
                    {unreadMessagesCount}{' '}
                    {t({ en: 'unread', es: 'sin leer' })}
                  </span>
                  <span>
                    <UsersRound size={13} />
                    {visibleConversations.length}{' '}
                    {t({ en: 'active chats', es: 'chats activos' })}
                  </span>
                </div>
              </div>

              <label className="messages-shell__search">
                <Search size={16} />
                <input
                  type="search"
                  value={conversationSearch}
                  onChange={(event) => setConversationSearch(event.target.value)}
                  placeholder={t({
                    en: 'Search conversations',
                    es: 'Buscar conversaciones',
                  })}
                  aria-label={t({
                    en: 'Search conversations',
                    es: 'Buscar conversaciones',
                  })}
                />
              </label>
            </div>

            <div className="messages-shell__stats">
              <article>
                <strong>{filteredConversations.length}</strong>
                <span>{t({ en: 'visible conversations', es: 'conversaciones visibles' })}</span>
              </article>
              <article>
                <strong>{unreadMessagesCount}</strong>
                <span>{t({ en: 'messages to review', es: 'mensajes por revisar' })}</span>
              </article>
            </div>

            <div className="messages-shell__section">
              <div className="messages-shell__section-header">
                <strong>{t({ en: 'Conversations', es: 'Conversaciones' })}</strong>
                <span>{filteredConversations.length}</span>
              </div>

              {filteredConversations.length ? (
                <div className="conversation-list">
                  {filteredConversations.map((item) => {
                    const partner = item.partner;

                    if (!partner) {
                      return null;
                    }

                    const isActive = item.conversation.id === activeConversation?.conversation.id;

                    return (
                      <button
                        key={item.conversation.id}
                        type="button"
                        className={
                          isActive
                            ? 'conversation-list__item conversation-list__item--active'
                            : 'conversation-list__item'
                        }
                        onClick={() => handleSelectConversation(item.conversation.id)}
                      >
                        <img src={partner.avatar} alt={partner.name} />
                        <div className="conversation-list__copy">
                          <div className="conversation-list__topline">
                            <strong>{partner.name}</strong>
                            <div className="conversation-list__meta">
                              {item.unreadCount ? (
                                <span className="conversation-list__badge">{item.unreadCount}</span>
                              ) : null}
                              {item.latestMessage ? (
                                <small>{formatTime(item.latestMessage.createdAt, locale)}</small>
                              ) : null}
                            </div>
                          </div>
                          <span>@{partner.username}</span>
                          <p>
                            {item.latestMessage?.body ??
                              t({
                                en: 'No messages yet. Start the first one.',
                                es: 'Todavia no hay mensajes. Inicia el primero.',
                              })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="messages-empty-inline">
                  <Sparkles size={16} />
                  {t({
                    en: 'No conversations match this search.',
                    es: 'No hay conversaciones que coincidan con esta busqueda.',
                  })}
                </div>
              )}
            </div>

            <div className="messages-shell__section">
              <div className="messages-shell__section-header">
                <strong>{t({ en: 'Suggested readers', es: 'Lectores sugeridos' })}</strong>
                <span>{suggestedReaders.length}</span>
              </div>
              <div className="message-suggestions">
                {suggestedReaders.length ? (
                  suggestedReaders.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="message-suggestions__item"
                      onClick={() => handleStartConversation(user.id)}
                    >
                      <img src={user.avatar} alt={user.name} />
                      <div>
                        <strong>{user.name}</strong>
                        <span>@{user.username}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="messages-empty-inline">
                    <UsersRound size={16} />
                    {t({
                      en: 'You already have active threads with everyone available.',
                      es: 'Ya tienes hilos activos con todas las personas disponibles.',
                    })}
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          <Reveal className="messages-shell__chat" delay={0.05}>
            {activeConversation?.partner ? (
              <article className="chat-window">
                <header className="chat-window__header">
                  <div className="chat-window__header-main">
                    <div className="chat-window__identity">
                      <img src={activeConversation.partner.avatar} alt={activeConversation.partner.name} />
                      <div className="chat-window__partner-copy">
                        <strong>{activeConversation.partner.name}</strong>
                        <span>@{activeConversation.partner.username}</span>
                        <small>
                          {t({
                            en: 'Direct thread',
                            es: 'Hilo directo',
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div className="chat-window__meta">
                    <span className="chat-window__status">
                      {activeConversation.unreadCount
                        ? t({
                            en: `${activeConversation.unreadCount} unread`,
                            es: `${activeConversation.unreadCount} sin leer`,
                          })
                        : t({
                            en: 'Up to date',
                            es: 'Al dia',
                          })}
                    </span>
                    <Link
                      className="button button--ghost button--compact"
                      to={`/profile/${activeConversation.partner.username}`}
                    >
                      {t({ en: 'Open profile', es: 'Abrir perfil' })}
                    </Link>
                  </div>
                </header>

                <div className="chat-window__timeline">
                  {activeConversation.conversation.messages.length ? (
                    activeConversation.conversation.messages.map((message, index, collection) => {
                      const previousMessage = collection[index - 1];
                      const isOwnMessage = message.senderId === currentUser.id;
                      const shouldShowDayMarker =
                        !previousMessage ||
                        formatDay(previousMessage.createdAt, locale) !==
                          formatDay(message.createdAt, locale);
                      const sender = getUserById(message.senderId);

                      return (
                        <div key={message.id} className="chat-window__entry">
                          {shouldShowDayMarker ? (
                            <div className="chat-window__day-marker">
                              <span>{formatDay(message.createdAt, locale)}</span>
                            </div>
                          ) : null}
                          <div className={isOwnMessage ? 'chat-message chat-message--own' : 'chat-message'}>
                            {!isOwnMessage ? (
                              <img
                                className="chat-message__avatar"
                                src={sender?.avatar}
                                alt={sender?.name}
                              />
                            ) : null}
                            <div className="chat-message__bubble">
                              <p>{message.body}</p>
                              <span>
                                {formatTime(message.createdAt, locale)}
                                {isOwnMessage
                                  ? message.status === 'seen'
                                    ? ` - ${t({ en: 'Seen', es: 'Visto' })}`
                                    : ` - ${t({ en: 'Sent', es: 'Enviado' })}`
                                  : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="chat-window__empty">
                      <MessageSquare size={18} />
                      {t({
                        en: 'No messages yet. Send the first note to start this thread.',
                        es: 'Todavia no hay mensajes. Envia la primera nota para abrir este hilo.',
                      })}
                    </div>
                  )}
                </div>

                <div className="chat-window__composer">
                  <div className="chat-window__quick-actions">
                    {quickReplies.map((quickReply) => (
                      <button
                        key={quickReply}
                        type="button"
                        className="chat-window__quick-button"
                        onClick={() => sendQuickReply(quickReply)}
                      >
                        {quickReply}
                      </button>
                    ))}
                  </div>
                  <div className="chat-window__composer-input">
                    <textarea
                      value={composer}
                      onChange={(event) => setComposer(event.target.value)}
                      placeholder={t({
                        en: 'Write a message...',
                        es: 'Escribe un mensaje...',
                      })}
                    />
                  </div>
                  <div className="settings-form__actions">
                    <button
                      type="button"
                      className="button button--primary"
                      onClick={sendComposedMessage}
                      disabled={!composer.trim()}
                    >
                      {t({ en: 'Send message', es: 'Enviar mensaje' })}
                    </button>
                  </div>
                </div>
              </article>
            ) : (
              <article className="chat-window chat-window--empty">
                <EmptyState
                  title={t({
                    en: 'Choose a conversation',
                    es: 'Elige una conversacion',
                  })}
                  description={t({
                    en: 'Select an existing thread or start one from suggested readers.',
                    es: 'Selecciona un hilo existente o inicia uno desde lectores sugeridos.',
                  })}
                  actionLabel={t({ en: 'Find readers', es: 'Buscar lectores' })}
                  actionTo="/readers"
                />
              </article>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default MessagesPage;
