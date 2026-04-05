import type { AuthAccount, Conversation, FollowRequest, NotificationItem } from '@/types';

export const seededAccounts: AuthAccount[] = [
  {
    userId: 'user-amelia',
    email: 'amelia@goodreads.social',
    password: 'reader123',
  },
  {
    userId: 'user-dorian',
    email: 'dorian@goodreads.social',
    password: 'reader123',
  },
  {
    userId: 'user-safiya',
    email: 'safiya@goodreads.social',
    password: 'reader123',
  },
  {
    userId: 'user-julian',
    email: 'julian@goodreads.social',
    password: 'reader123',
  },
  {
    userId: 'user-noor',
    email: 'noor@goodreads.social',
    password: 'reader123',
  },
];

export const seededConversations: Conversation[] = [
  {
    id: 'conversation-amelia-dorian',
    participantIds: ['user-amelia', 'user-dorian'],
    updatedAt: '2026-03-28T21:14:00.000Z',
    messages: [
      {
        id: 'message-1',
        conversationId: 'conversation-amelia-dorian',
        senderId: 'user-dorian',
        body: 'Acabo de terminar The Glass Archive. Tiene una atmosfera brutal.',
        createdAt: '2026-03-28T20:41:00.000Z',
        status: 'seen',
      },
      {
        id: 'message-2',
        conversationId: 'conversation-amelia-dorian',
        senderId: 'user-amelia',
        body: 'Totalmente. La portada ya promete mucho, pero por dentro esta mejor.',
        createdAt: '2026-03-28T20:49:00.000Z',
        status: 'seen',
      },
      {
        id: 'message-3',
        conversationId: 'conversation-amelia-dorian',
        senderId: 'user-dorian',
        body: 'Si haces club de lectura con ese, me apunto.',
        createdAt: '2026-03-28T21:14:00.000Z',
        status: 'seen',
      },
    ],
  },
  {
    id: 'conversation-amelia-safiya',
    participantIds: ['user-amelia', 'user-safiya'],
    updatedAt: '2026-03-29T07:35:00.000Z',
    messages: [
      {
        id: 'message-4',
        conversationId: 'conversation-amelia-safiya',
        senderId: 'user-safiya',
        body: 'Voy a preparar una lista curada de ficcion historica. Te la mando luego.',
        createdAt: '2026-03-29T07:12:00.000Z',
        status: 'seen',
      },
      {
        id: 'message-5',
        conversationId: 'conversation-amelia-safiya',
        senderId: 'user-amelia',
        body: 'Perfecto. Quiero que se sienta editorial, no solo popular.',
        createdAt: '2026-03-29T07:35:00.000Z',
        status: 'seen',
      },
    ],
  },
  {
    id: 'conversation-amelia-julian',
    participantIds: ['user-amelia', 'user-julian'],
    updatedAt: '2026-03-27T18:04:00.000Z',
    messages: [
      {
        id: 'message-6',
        conversationId: 'conversation-amelia-julian',
        senderId: 'user-julian',
        body: 'Tu banner nuevo para el perfil quedaria increible con tonos cobre.',
        createdAt: '2026-03-27T17:59:00.000Z',
        status: 'seen',
      },
      {
        id: 'message-7',
        conversationId: 'conversation-amelia-julian',
        senderId: 'user-amelia',
        body: 'Eso quiero probar en la siguiente iteracion. Muy buena idea.',
        createdAt: '2026-03-27T18:04:00.000Z',
        status: 'seen',
      },
    ],
  },
];

export const seededFollowRequests: FollowRequest[] = [
  {
    id: 'request-1',
    requesterId: 'user-dorian',
    targetUserId: 'user-noor',
    createdAt: '2026-03-29T05:40:00.000Z',
    status: 'pending',
  },
];

export const seededNotifications: NotificationItem[] = [
  {
    id: 'notification-1',
    userId: 'user-amelia',
    type: 'message',
    actorUserId: 'user-safiya',
    message: 'Te envio una nueva recomendacion historica.',
    createdAt: '2026-03-29T07:35:00.000Z',
    read: false,
  },
  {
    id: 'notification-2',
    userId: 'user-amelia',
    type: 'activity',
    actorUserId: 'user-julian',
    bookId: 'book-paper-moons',
    createdAt: '2026-03-28T22:40:00.000Z',
    read: false,
  },
  {
    id: 'notification-3',
    userId: 'user-noor',
    type: 'follow-request',
    actorUserId: 'user-dorian',
    requestId: 'request-1',
    createdAt: '2026-03-29T05:40:00.000Z',
    read: false,
  },
];
