import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { MessageCircleMore, Search, SendHorizontal, SquarePen } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';
import { Reveal } from '@/components/common/Reveal';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { localizeUser } from '@/i18n/localize';
import type { Conversation } from '@/types';

const formatMessageTime = (value: string, locale: 'es' | 'en') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));

const formatConversationTime = (value: string, locale: 'es' | 'en') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));

const formatTimelineLabel = (value: string, locale: 'es' | 'en') =>
  new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', {
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));

const isSameDay = (left: string, right: string) => {
  const leftDate = new Date(left);
  const rightDate = new Date(right);

  return (
    leftDate.getFullYear() === rightDate.getFullYear() &&
    leftDate.getMonth() === rightDate.getMonth() &&
    leftDate.getDate() === rightDate.getDate()
  );
};

export function MessagesPage() {
  const { locale, t } = useLanguage();
  const {
    currentUser,
    conversations,
    getConversationWith,
    getUserById,
    getUserByUsername,
    markConversationAsSeen,
    openConversation,
    sendMessage,
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draft, setDraft] = useState('');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    const selectedUsername = searchParams.get('user');

    if (!selectedUsername || !currentUser) {
      return;
    }

    const targetUser = getUserByUsername(selectedUsername);

    if (targetUser && targetUser.id !== currentUser.id) {
      openConversation(targetUser.id);
    }
  }, [currentUser, getUserByUsername, openConversation, searchParams]);

  const conversationList = useMemo(() => {
    if (!currentUser) {
      return [];
    }

    const normalizedSearch = searchValue.trim().toLowerCase();

    return conversations
      .filter((conversation) => conversation.participantIds.includes(currentUser.id))
      .filter((conversation) => {
        if (!normalizedSearch) {
          return true;
        }

        const partnerId = conversation.participantIds.find((id) => id !== currentUser.id);
        const partner = partnerId ? getUserById(partnerId) : undefined;
        const lastMessage = conversation.messages.at(-1)?.body ?? '';
        const haystack = `${partner?.name ?? ''} ${partner?.username ?? ''} ${lastMessage}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .sort(
        (leftConversation, rightConversation) =>
          new Date(rightConversation.updatedAt).getTime() -
          new Date(leftConversation.updatedAt).getTime(),
      );
  }, [conversations, currentUser, getUserById, searchValue]);

  const selectedUsername = searchParams.get('user');
  const selectedUser = selectedUsername ? getUserByUsername(selectedUsername) : undefined;
  const activeConversation =
    (selectedUser && getConversationWith(selectedUser.id)) || conversationList[0];
  const activePartner = activeConversation
    ? getUserById(activeConversation.participantIds.find((id) => id !== currentUser?.id) ?? '')
    : undefined;
  useEffect(() => {
    if (activeConversation) {
      markConversationAsSeen(activeConversation.id);
    }
  }, [activeConversation, markConversationAsSeen]);

  const handleSelectConversation = (conversation: Conversation) => {
    const partnerId = conversation.participantIds.find((id) => id !== currentUser?.id);
    const partner = partnerId ? getUserById(partnerId) : undefined;

    if (partner) {
      setSearchParams({ user: partner.username });
    }
  };

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activePartner || !draft.trim()) {
      return;
    }

    sendMessage(activePartner.id, draft);
    setDraft('');
  };

  if (!currentUser) {
    return (
      <section className="section page-top-spacing">
        <div className="container">
          <EmptyState
            title={t({
              en: 'Login to open your conversations',
              es: 'Inicia sesion para abrir tus conversaciones',
            })}
            description={t({
              en: 'Messaging belongs to your account layer.',
              es: 'La mensajeria pertenece a tu capa de cuenta.',
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
          <div className="messages-shell">
            <aside className="messages-shell__sidebar">
              <div className="messages-shell__toolbar">
                <Link className="button button--ghost" to="/search?tab=users">
                  <SquarePen size={14} />
                  {t({ en: 'New chat', es: 'Nuevo chat' })}
                </Link>
              </div>

              <label className="messages-shell__search">
                <Search size={14} />
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder={t({ en: 'Search chats', es: 'Buscar chats' })}
                />
              </label>

              <div className="messages-shell__section">
                <div className="messages-shell__section-header">
                  <strong>{t({ en: 'Chats', es: 'Chats' })}</strong>
                  <span>{conversationList.length}</span>
                </div>
                {conversationList.length ? (
                  <div className="conversation-list">
                    {conversationList.map((conversation) => {
                      const partnerId = conversation.participantIds.find((id) => id !== currentUser.id);
                      const partner = partnerId ? getUserById(partnerId) : undefined;
                      const lastMessage = conversation.messages.at(-1);
                      const unreadCount = conversation.messages.filter(
                        (message) => message.senderId !== currentUser.id && message.status === 'sent',
                      ).length;

                      if (!partner) {
                        return null;
                      }

                      return (
                        <button
                          key={conversation.id}
                          type="button"
                          className={
                            activeConversation?.id === conversation.id
                              ? 'conversation-list__item conversation-list__item--active'
                              : 'conversation-list__item'
                          }
                          onClick={() => handleSelectConversation(conversation)}
                        >
                          <img src={partner.avatar} alt={partner.name} />
                          <div className="conversation-list__copy">
                            <div className="conversation-list__topline">
                              <strong>{partner.name}</strong>
                              <div className="conversation-list__meta">
                                {unreadCount ? <span className="conversation-list__badge">{unreadCount}</span> : null}
                                <span>{formatConversationTime(conversation.updatedAt, locale)}</span>
                              </div>
                            </div>
                            <small>@{partner.username}</small>
                            <p>{lastMessage?.body ?? t({ en: 'No messages yet', es: 'Aun sin mensajes' })}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="messages-empty-inline">
                    <MessageCircleMore size={18} />
                    <span>{t({ en: 'No chats yet.', es: 'Aun no hay chats.' })}</span>
                  </div>
                )}
              </div>
            </aside>

            <div className="messages-shell__chat">
              {activePartner && activeConversation ? (
                <div className="chat-window">
                  <header className="chat-window__header">
                    <div className="chat-window__header-main">
                      <div className="chat-window__identity">
                        <img src={activePartner.avatar} alt={activePartner.name} />
                        <div className="chat-window__partner-copy">
                          <strong>{activePartner.name}</strong>
                          <span>@{activePartner.username}</span>
                          <small>{localizeUser(activePartner, locale).role}</small>
                        </div>
                      </div>
                    </div>
                    <div className="chat-window__meta">
                      <Link className="button button--ghost button--compact" to={`/profile/${activePartner.username}`}>
                        {t({ en: 'View profile', es: 'Ver perfil' })}
                      </Link>
                    </div>
                  </header>

                  <div className="chat-window__timeline">
                    {activeConversation.messages.length ? (
                      activeConversation.messages.map((message, index) => {
                        const isOwnMessage = message.senderId === currentUser.id;
                        const previousMessage = activeConversation.messages[index - 1];
                        const showDayMarker =
                          index === 0 || !isSameDay(previousMessage.createdAt, message.createdAt);

                        return (
                          <div key={message.id} className="chat-window__entry">
                            {showDayMarker ? (
                              <div className="chat-window__day-marker">
                                <span>{formatTimelineLabel(message.createdAt, locale)}</span>
                              </div>
                            ) : null}
                            <article
                              className={isOwnMessage ? 'chat-message chat-message--own' : 'chat-message'}
                            >
                              {!isOwnMessage ? (
                                <img
                                  src={activePartner.avatar}
                                  alt={activePartner.name}
                                  className="chat-message__avatar"
                                />
                              ) : null}
                              <div className="chat-message__bubble">
                                <p>{message.body}</p>
                                <span>{formatMessageTime(message.createdAt, locale)}</span>
                              </div>
                            </article>
                          </div>
                        );
                      })
                    ) : (
                      <div className="chat-window__empty">
                        <MessageCircleMore size={18} />
                        <span>{t({ en: 'Send the first message.', es: 'Envia el primer mensaje.' })}</span>
                      </div>
                    )}
                  </div>

                  <form className="chat-window__composer" onSubmit={handleSendMessage}>
                    <div className="chat-window__composer-input">
                      <textarea
                        rows={2}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        placeholder={t({
                          en: 'Write a recommendation or quick reply...',
                          es: 'Escribe una recomendacion o respuesta rapida...',
                        })}
                      />
                    </div>
                    <button type="submit" className="button button--primary">
                      <SendHorizontal size={14} />
                      {t({ en: 'Send', es: 'Enviar' })}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="chat-window chat-window--empty">
                  <EmptyState
                    title={t({ en: 'Choose a conversation', es: 'Elige una conversacion' })}
                    description={t({
                      en: 'Open a chat from the sidebar or start a new one.',
                      es: 'Abre un chat desde la barra lateral o empieza uno nuevo.',
                    })}
                    actionLabel={t({ en: 'Find readers', es: 'Buscar lectores' })}
                    actionTo="/search?tab=users"
                  />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
