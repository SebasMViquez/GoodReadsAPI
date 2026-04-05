import { reviews as seededReviews, users as seededUsers } from '@/services/api/catalog';
import {
  seededAccounts,
  seededConversations,
  seededFollowRequests,
  seededNotifications,
} from '@/data/social';
import type {
  AuthAccount,
  Conversation,
  FollowRequest,
  NotificationItem,
  Review,
  User,
} from '@/types';
import { browserStorage } from '@/services/storage/browserStorage';
import { sessionStore } from '@/services/session/sessionStore';

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
}

export interface AuthState {
  currentSessionToken: string | null;
  users: User[];
  reviews: Review[];
  accounts: AuthAccount[];
  followingByUser: Record<string, string[]>;
  conversations: Conversation[];
  followRequests: FollowRequest[];
  notifications: NotificationItem[];
  sessions: SessionRecord[];
}

interface PersistedAuthState {
  users: User[];
  reviews: Review[];
  accounts: AuthAccount[];
  followingByUser: Record<string, string[]>;
  conversations: Conversation[];
  followRequests: FollowRequest[];
  notifications: NotificationItem[];
  sessions: SessionRecord[];
}

const storageKey = 'goodreads-auth-state';

export const seededFollowingByUser: Record<string, string[]> = {
  'user-amelia': ['user-dorian', 'user-safiya', 'user-julian'],
  'user-dorian': ['user-amelia', 'user-julian'],
  'user-safiya': ['user-amelia', 'user-noor'],
  'user-julian': ['user-amelia'],
  'user-noor': ['user-amelia', 'user-safiya'],
};

const cloneUser = (user: User): User => ({
  ...user,
  role: { ...user.role },
  bio: { ...user.bio },
  pagesRead: { ...user.pagesRead },
  badges: user.badges.map((badge) => ({ ...badge })),
  currentlyReading: user.currentlyReading.map((entry) => ({ ...entry })),
  favoriteGenres: [...user.favoriteGenres],
  wantToRead: [...user.wantToRead],
  read: [...user.read],
  favoriteBooks: [...user.favoriteBooks],
  featuredReviews: [...user.featuredReviews],
  activity: user.activity.map((item) => ({
    ...item,
    content: { ...item.content },
    createdAt: { ...item.createdAt },
    likedBy: [...(item.likedBy ?? [])],
    commentItems: (item.commentItems ?? []).map((comment) => ({ ...comment })),
  })),
});

export const cloneReview = (review: Review): Review => ({
  ...review,
  title: { ...review.title },
  excerpt: { ...review.excerpt },
  body: { ...review.body },
  createdAt: { ...review.createdAt },
  likedBy: [...(review.likedBy ?? [])],
  commentItems: (review.commentItems ?? []).map((comment) => ({ ...comment })),
});

export const createDefaultAuthState = (): AuthState => ({
  currentSessionToken: sessionStore.getToken(),
  users: seededUsers.map(cloneUser),
  reviews: seededReviews.map(cloneReview),
  accounts: seededAccounts.map((account) => ({ ...account })),
  followingByUser: Object.fromEntries(
    Object.entries(seededFollowingByUser).map(([userId, following]) => [userId, [...following]]),
  ),
  conversations: seededConversations.map((conversation) => ({
    ...conversation,
    participantIds: [...conversation.participantIds] as [string, string],
    messages: conversation.messages.map((message) => ({ ...message })),
  })),
  followRequests: seededFollowRequests.map((request) => ({ ...request })),
  notifications: seededNotifications.map((notification) => ({ ...notification })),
  sessions: [],
});

const isPersistedAuthState = (value: unknown): value is PersistedAuthState =>
  Boolean(value) &&
  typeof value === 'object' &&
  Array.isArray((value as PersistedAuthState).users) &&
  Array.isArray((value as PersistedAuthState).reviews) &&
  Array.isArray((value as PersistedAuthState).accounts) &&
  Array.isArray((value as PersistedAuthState).conversations) &&
  Array.isArray((value as PersistedAuthState).followRequests) &&
  Array.isArray((value as PersistedAuthState).notifications) &&
  Array.isArray((value as PersistedAuthState).sessions) &&
  Boolean((value as PersistedAuthState).followingByUser);

export const loadPersistedAuthState = (): AuthState => {
  const parsed = browserStorage.getJSON<PersistedAuthState>(storageKey);

  if (!isPersistedAuthState(parsed)) {
    return createDefaultAuthState();
  }

  return {
    currentSessionToken: sessionStore.getToken(),
    users: parsed.users as User[],
    reviews: parsed.reviews as Review[],
    accounts: parsed.accounts as AuthAccount[],
    followingByUser: parsed.followingByUser as Record<string, string[]>,
    conversations: parsed.conversations as Conversation[],
    followRequests: parsed.followRequests as FollowRequest[],
    notifications: parsed.notifications as NotificationItem[],
    sessions: parsed.sessions as SessionRecord[],
  };
};

export const savePersistedAuthState = (state: AuthState) => {
  const persistedState: PersistedAuthState = {
    users: state.users,
    reviews: state.reviews,
    accounts: state.accounts,
    followingByUser: state.followingByUser,
    conversations: state.conversations,
    followRequests: state.followRequests,
    notifications: state.notifications,
    sessions: state.sessions,
  };
  browserStorage.setJSON(storageKey, persistedState);
};

export const createSessionForUser = (state: AuthState, userId: string) => {
  const token = `session-${crypto.randomUUID().slice(0, 12)}`;
  const nextState: AuthState = {
    ...state,
    currentSessionToken: token,
    sessions: [
      {
        token,
        userId,
        createdAt: new Date().toISOString(),
      },
      ...state.sessions.filter((session) => session.token !== token),
    ],
  };

  sessionStore.setToken(token);
  return nextState;
};

export const clearCurrentSession = (state: AuthState) => {
  const currentToken = state.currentSessionToken;

  sessionStore.clear();

  if (!currentToken) {
    return {
      ...state,
      currentSessionToken: null,
    };
  }

  return {
    ...state,
    currentSessionToken: null,
    sessions: state.sessions.filter((session) => session.token !== currentToken),
  };
};

export const resolveCurrentUserId = (state: AuthState) =>
  state.sessions.find((session) => session.token === state.currentSessionToken)?.userId ?? null;
