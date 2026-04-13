import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useToast } from '@/context/ToastContext';
import {
  authClient,
  type RemoteUserProfile,
  type UpdateRemoteProfileInput,
} from '@/services/api/authClient';
import type { AuthState } from '@/services/api/mock/authState';
import {
  clearIdentifiedUser,
  identifyUser,
  reportError,
  trackEvent,
} from '@/services/monitoring/reporting';
import type {
  ActivityItem,
  Conversation,
  FeedActivityItem,
  FollowRequest,
  Locale,
  NotificationItem,
  Review,
  SocialComment,
  User,
} from '@/types';

interface AuthActionResult {
  success: boolean;
  error?: string;
}

interface LoginInput {
  identifier: string;
  password: string;
}

interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

interface UpdateProfileInput {
  locale: Locale;
  name: string;
  username: string;
  email: string;
  location: string;
  website: string;
  profileVisibility: User['profileVisibility'];
  avatar: string;
  banner: string;
  role: string;
  bio: string;
}

interface AuthContextValue {
  currentUser: User | null;
  error: string | null;
  isAuthenticated: boolean;
  retry: () => void;
  status: 'loading' | 'ready' | 'error';
  users: User[];
  reviews: Review[];
  featuredReviews: Review[];
  topReviewers: User[];
  activityFeed: FeedActivityItem[];
  conversations: Conversation[];
  followRequests: FollowRequest[];
  notifications: NotificationItem[];
  unreadMessagesCount: number;
  unreadNotificationsCount: number;
  login: (input: LoginInput) => Promise<AuthActionResult>;
  register: (input: RegisterInput) => Promise<AuthActionResult>;
  logout: () => void;
  updateProfile: (input: UpdateProfileInput) => Promise<AuthActionResult>;
  changePassword: (input: ChangePasswordInput) => Promise<AuthActionResult>;
  isUsernameAvailable: (username: string, excludeUserId?: string) => boolean;
  getUserById: (userId: string) => User | undefined;
  getUserByUsername: (username: string) => User | undefined;
  getReviewsForBook: (bookId: string) => Review[];
  getReviewsForUser: (userId: string) => Review[];
  getFollowersForUser: (userId: string) => User[];
  getFollowingForUser: (userId: string) => User[];
  isFollowingUser: (userId: string) => boolean;
  hasPendingFollowRequest: (targetUserId: string) => boolean;
  toggleFollowUser: (targetUserId: string) => void;
  respondToFollowRequest: (requestId: string, status: 'accepted' | 'declined') => void;
  createReview: (input: {
    bookId: string;
    rating: number;
    title: string;
    excerpt: string;
    body: string;
  }) => Promise<AuthActionResult>;
  toggleLikeReview: (reviewId: string) => void;
  addCommentToReview: (reviewId: string, body: string) => void;
  toggleLikeActivity: (activityId: string) => void;
  addCommentToActivity: (activityId: string, body: string) => void;
  getConversationWith: (partnerUserId: string) => Conversation | undefined;
  openConversation: (partnerUserId: string) => void;
  markConversationAsSeen: (conversationId: string) => void;
  sendMessage: (partnerUserId: string, body: string) => void;
  markNotificationsAsRead: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const normalizeUsername = (value: string) => value.trim().toLowerCase().replace(/^@/, '');
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const createId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const localizeNow = () => ({ en: 'Just now', es: 'ahora' });
const sanitizeHandle = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
const DEFAULT_AVATAR_PLACEHOLDER =
  'https://api.dicebear.com/9.x/shapes/svg?seed=goodreads-reader';
const DEFAULT_BANNER_PLACEHOLDER =
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80';

const createFallbackSessionUser = (
  userId: string,
  sessionUser: ReturnType<typeof authClient.getSupabaseSessionUser>,
): User => {
  const metadata = sessionUser?.user_metadata ?? {};
  const metadataName = typeof metadata.name === 'string' ? metadata.name.trim() : '';
  const metadataUsername = typeof metadata.username === 'string' ? metadata.username.trim() : '';
  const email = sessionUser?.email?.trim() ?? '';
  const emailHandle = email ? email.split('@')[0] : '';
  const rawUsername = metadataUsername || emailHandle || 'user';
  const username = sanitizeHandle(rawUsername) || 'user';
  const name = metadataName || emailHandle || '';

  return {
    id: userId,
    name,
    username,
    email,
    avatar: DEFAULT_AVATAR_PLACEHOLDER,
    banner: DEFAULT_BANNER_PLACEHOLDER,
    role: {
      en: '',
      es: '',
    },
    bio: {
      en: '',
      es: '',
    },
    location: '',
    website: '',
    profileVisibility: 'public',
    followersCount: 0,
    followingCount: 0,
    booksRead: 0,
    pagesRead: {
      en: '',
      es: '',
    },
    streak: 0,
    favoriteGenres: [],
    badges: [],
    wantToRead: [],
    currentlyReading: [],
    read: [],
    favoriteBooks: [],
    featuredReviews: [],
    activity: [],
  };
};

const adjustFollowCounts = (
  users: User[],
  followerId: string,
  targetUserId: string,
  delta: number,
) =>
  users.map((user) => {
    if (user.id === followerId) {
      return {
        ...user,
        followingCount: Math.max(0, user.followingCount + delta),
      };
    }

    if (user.id === targetUserId) {
      return {
        ...user,
        followersCount: Math.max(0, user.followersCount + delta),
      };
    }

    return user;
  });

const updateUserActivity = (
  users: User[],
  userId: string,
  updater: (activity: ActivityItem[]) => ActivityItem[],
) =>
  users.map((user) =>
    user.id === userId
      ? {
          ...user,
          activity: updater(user.activity),
        }
        : user,
  );

const mergeRemoteUserWithLocal = (remoteUser: RemoteUserProfile, localUser?: User): User => ({
  id: remoteUser.id,
  name: remoteUser.name,
  username: remoteUser.username,
  email: remoteUser.email,
  avatar: remoteUser.avatar,
  banner: remoteUser.banner,
  role: remoteUser.role,
  bio: remoteUser.bio,
  location: remoteUser.location,
  website: remoteUser.website,
  profileVisibility: remoteUser.profileVisibility,
  followersCount: remoteUser.followersCount,
  followingCount: remoteUser.followingCount,
  booksRead: remoteUser.booksRead,
  pagesRead: remoteUser.pagesRead,
  streak: remoteUser.streak,
  favoriteGenres: remoteUser.favoriteGenres,
  badges: remoteUser.badges,
  wantToRead: localUser?.wantToRead ?? [],
  currentlyReading: localUser?.currentlyReading ?? [],
  read: localUser?.read ?? [],
  favoriteBooks: localUser?.favoriteBooks ?? [],
  featuredReviews: localUser?.featuredReviews ?? [],
  activity: localUser?.activity ?? [],
});

const mergeRemoteUsers = (currentUsers: User[], remoteUsers: RemoteUserProfile[]): User[] => {
  const localById = new Map(currentUsers.map((user) => [user.id, user]));
  return remoteUsers.map((remoteUser) =>
    mergeRemoteUserWithLocal(remoteUser, localById.get(remoteUser.id)),
  );
};

const mergeIncomingPendingRequests = (
  existingRequests: FollowRequest[],
  currentUserId: string,
  incomingPendingRequests: FollowRequest[],
) => {
  const incomingIds = new Set(incomingPendingRequests.map((request) => request.id));
  const preservedRequests = existingRequests.filter((request) => {
    if (incomingIds.has(request.id)) {
      return false;
    }

    if (request.targetUserId === currentUserId && request.status === 'pending') {
      return false;
    }

    return true;
  });

  return [...incomingPendingRequests, ...preservedRequests];
};

const mergeDerivedFollowRequestNotifications = (
  existingNotifications: NotificationItem[],
  followRequests: FollowRequest[],
  currentUserId: string | null,
): NotificationItem[] => {
  if (!currentUserId) {
    return existingNotifications;
  }

  const pendingRequestsForCurrentUser = followRequests.filter(
    (request) =>
      request.targetUserId === currentUserId &&
      request.status === 'pending',
  );

  if (!pendingRequestsForCurrentUser.length) {
    return existingNotifications;
  }

  const existingByRequestId = new Map(
    existingNotifications
      .filter(
        (notification) =>
          notification.type === 'follow-request' &&
          notification.requestId,
      )
      .map((notification) => [notification.requestId as string, notification]),
  );

  const syntheticNotifications = pendingRequestsForCurrentUser
    .filter((request) => !existingByRequestId.has(request.id))
    .map<NotificationItem>((request) => ({
      id: `follow-request-${request.id}`,
      userId: currentUserId,
      type: 'follow-request',
      actorUserId: request.requesterId,
      requestId: request.id,
      createdAt: request.createdAt,
      // Synthetic entries are display-only; keep them read by default.
      read: true,
    }));

  return [...syntheticNotifications, ...existingNotifications];
};

export function AuthProvider({ children }: PropsWithChildren) {
  const { showToast } = useToast();
  const [state, setState] = useState<AuthState>(authClient.createInitialState);
  const stateRef = useRef(state);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [bootstrapVersion, setBootstrapVersion] = useState(0);
  const currentSessionUserId = useMemo(() => authClient.resolveCurrentUserId(state), [state]);
  const currentUser = useMemo(() => {
    if (!currentSessionUserId) {
      return null;
    }

    const matchedUser = state.users.find((user) => user.id === currentSessionUserId);
    if (matchedUser) {
      return matchedUser;
    }

    if (!authClient.isSupabaseAuthEnabled()) {
      return null;
    }

    const sessionUser = authClient.getSupabaseSessionUser();
    if (!sessionUser || sessionUser.id !== currentSessionUserId) {
      return createFallbackSessionUser(currentSessionUserId, null);
    }

    return createFallbackSessionUser(currentSessionUserId, sessionUser);
  }, [currentSessionUserId, state.users]);
  const currentUserId = currentUser?.id ?? currentSessionUserId ?? null;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const buildBackendSyncedState = useCallback(
    async (baseState: AuthState): Promise<AuthState> => {
      if (!authClient.isBackendEnabled()) {
        return baseState;
      }

      const remoteUsers = await authClient.fetchUsers();
      const mergedUsers = mergeRemoteUsers(baseState.users, remoteUsers);
      const followingEntries = await Promise.all(
        remoteUsers.map(async (user) => {
          try {
            return {
              userId: user.id,
              followingUserIds: await authClient.fetchFollowingUserIds(user.id),
            };
          } catch {
            return {
              userId: user.id,
              followingUserIds: baseState.followingByUser[user.id] ?? [],
            };
          }
        }),
      );

      const followingByUser = { ...baseState.followingByUser };
      followingEntries.forEach(({ userId, followingUserIds }) => {
        followingByUser[userId] = followingUserIds;
      });

      const currentUserId = authClient.resolveCurrentUserId(baseState);
      const followRequests = currentUserId
        ? mergeIncomingPendingRequests(
            baseState.followRequests,
            currentUserId,
            await authClient.fetchPendingFollowRequests(currentUserId).catch(() => []),
          )
        : baseState.followRequests;

      return {
        ...baseState,
        users: mergedUsers,
        followingByUser,
        followRequests,
      };
    },
    [],
  );

  const refreshBackendSocialState = useCallback(async () => {
    if (!authClient.isBackendEnabled()) {
      return;
    }

    try {
      const nextState = await buildBackendSyncedState(stateRef.current);
      setState(nextState);
    } catch (caughtError) {
      reportError(caughtError, { scope: 'auth.remoteSync' });
    }
  }, [buildBackendSyncedState]);

  useEffect(() => {
    let cancelled = false;

    const hydrate = async () => {
      setStatus('loading');
      setError(null);

      try {
        let nextState = await authClient.hydrate();

        if (authClient.isSupabaseAuthEnabled()) {
          const supabaseUserId = await authClient.restoreSupabaseSession();

          nextState = supabaseUserId
            ? authClient.createSession(nextState, supabaseUserId)
            : authClient.clearSession(nextState);
        }

        if (authClient.isBackendEnabled()) {
          try {
            nextState = await buildBackendSyncedState(nextState);
          } catch (remoteSyncError) {
            reportError(remoteSyncError, { scope: 'auth.hydrate.remoteSync' });
          }
        }

        if (cancelled) {
          return;
        }

        setState(nextState);
        setStatus('ready');
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        reportError(caughtError, { scope: 'auth.hydrate' });
        setError('We could not restore the account session.');
        setStatus('error');
      }
    };

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [bootstrapVersion, buildBackendSyncedState]);

  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    void authClient.persist(state).catch((caughtError) => {
      reportError(caughtError, { scope: 'auth.persist' });
      setError('We could not save the latest account state.');
      setStatus('error');
    });
  }, [state, status]);

  useEffect(() => {
    if (!currentUser) {
      clearIdentifiedUser();
      return;
    }

    identifyUser({
      email: currentUser.email,
      id: currentUser.id,
      username: currentUser.username,
    });
  }, [currentUser]);

  useEffect(() => {
    if (status !== 'ready' || !currentUserId || !authClient.isBackendEnabled()) {
      return;
    }

    void refreshBackendSocialState();
  }, [currentUserId, refreshBackendSocialState, status]);

  const retry = useCallback(() => {
    setBootstrapVersion((currentValue) => currentValue + 1);
  }, []);

  const isAuthenticated = Boolean(currentSessionUserId);

  const getUserById = useCallback(
    (userId: string) => state.users.find((user) => user.id === userId),
    [state.users],
  );

  const getUserByUsername = useCallback(
    (username: string) =>
      state.users.find((user) => normalizeUsername(user.username) === normalizeUsername(username)),
    [state.users],
  );

  const getReviewsForBook = useCallback(
    (bookId: string) => state.reviews.filter((review) => review.bookId === bookId),
    [state.reviews],
  );

  const getReviewsForUser = useCallback(
    (userId: string) => state.reviews.filter((review) => review.userId === userId),
    [state.reviews],
  );

  const getFollowingForUser = useCallback(
    (userId: string) =>
      (state.followingByUser[userId] ?? [])
        .map((followedUserId) => getUserById(followedUserId))
        .filter((user): user is User => Boolean(user)),
    [getUserById, state.followingByUser],
  );

  const getFollowersForUser = useCallback(
    (userId: string) =>
      state.users.filter((user) => (state.followingByUser[user.id] ?? []).includes(userId)),
    [state.followingByUser, state.users],
  );

  const isUsernameAvailable = useCallback(
    (username: string, excludeUserId?: string) => {
      const normalized = normalizeUsername(username);

      if (!normalized) {
        return false;
      }

      return !state.users.some(
        (user) =>
          user.id !== excludeUserId && normalizeUsername(user.username) === normalized,
      );
    },
    [state.users],
  );

  const resolveLoginEmail = useCallback(
    async (identifier: string) => {
      const trimmedIdentifier = identifier.trim();

      if (!trimmedIdentifier) {
        return null;
      }

      if (trimmedIdentifier.includes('@')) {
        return normalizeEmail(trimmedIdentifier);
      }

      const normalizedUsername = normalizeUsername(trimmedIdentifier);

      const localUser = state.users.find(
        (user) => normalizeUsername(user.username) === normalizedUsername,
      );

      if (localUser?.email) {
        return normalizeEmail(localUser.email);
      }

      if (!authClient.isBackendEnabled()) {
        return null;
      }

      try {
        const remoteUsers = await authClient.fetchUsers(trimmedIdentifier);
        const remoteUser = remoteUsers.find(
          (user) => normalizeUsername(user.username) === normalizedUsername,
        );

        return remoteUser?.email ? normalizeEmail(remoteUser.email) : null;
      } catch {
        return null;
      }
    },
    [state.users],
  );

  const login = useCallback(
    async ({ identifier, password }: LoginInput): Promise<AuthActionResult> => {
      if (status !== 'ready') {
        return {
          success: false,
          error: 'The account service is still loading. Try again in a moment.',
        };
      }

      if (authClient.isSupabaseAuthEnabled()) {
        const resolvedEmail = await resolveLoginEmail(identifier);

        if (!resolvedEmail) {
          trackEvent('auth_login_failed', { identifierType: identifier.includes('@') ? 'email' : 'username' });
          return {
            success: false,
            error: 'We could not map that username/email to a Supabase account.',
          };
        }

        try {
          const supabaseUserId = await authClient.signInWithSupabase(resolvedEmail, password);

          if (!supabaseUserId) {
            return {
              success: false,
              error: 'Supabase login did not return an active session.',
            };
          }

          setState((currentState) => authClient.createSession(currentState, supabaseUserId));

          if (authClient.isBackendEnabled()) {
            void refreshBackendSocialState();
          }

          showToast(
            {
              en: 'Session ready.',
              es: 'Sesion lista.',
            },
            'success',
          );

          trackEvent('auth_login_succeeded', { userId: supabaseUserId, provider: 'supabase' });
          return { success: true };
        } catch (caughtError) {
          reportError(caughtError, { scope: 'auth.login.supabase' });
          trackEvent('auth_login_failed', { identifierType: identifier.includes('@') ? 'email' : 'username' });
          return {
            success: false,
            error: caughtError instanceof Error
              ? caughtError.message
              : 'Supabase login failed.',
          };
        }
      }

      const normalizedIdentifier = identifier.trim();
      const normalizedIdentifierEmail = normalizeEmail(normalizedIdentifier);
      const normalizedIdentifierUsername = normalizeUsername(normalizedIdentifier);

      const account = state.accounts.find((candidate) => {
        if (normalizeEmail(candidate.email) === normalizedIdentifierEmail) {
          return true;
        }

        const user = state.users.find((candidateUser) => candidateUser.id === candidate.userId);
        return normalizeUsername(user?.username ?? '') === normalizedIdentifierUsername;
      });

      if (!account || account.password !== password) {
        trackEvent('auth_login_failed', { identifierType: normalizedIdentifier.includes('@') ? 'email' : 'username' });
        return {
          success: false,
          error: 'We could not verify those credentials. Check your email or username and try again.',
        };
      }

      setState((currentState) => authClient.createSession(currentState, account.userId));

      showToast(
        {
          en: 'Session ready.',
          es: 'Sesion lista.',
        },
        'success',
      );

      trackEvent('auth_login_succeeded', { userId: account.userId });

      return { success: true };
    },
    [refreshBackendSocialState, resolveLoginEmail, showToast, state.accounts, state.users, status],
  );

  const register = useCallback(
    async ({ email, name, password, username }: RegisterInput): Promise<AuthActionResult> => {
      if (status !== 'ready') {
        return {
          success: false,
          error: 'The account service is still loading. Try again in a moment.',
        };
      }

      const normalizedNewUsername = normalizeUsername(username);
      const normalizedNewEmail = normalizeEmail(email);

      if (authClient.isSupabaseAuthEnabled()) {
        if (!isUsernameAvailable(normalizedNewUsername)) {
          return {
            success: false,
            error: 'That username is already taken.',
          };
        }

        try {
          const registration = await authClient.signUpWithSupabase({
            email: normalizedNewEmail,
            name: name.trim(),
            password,
            username: normalizedNewUsername,
          });

          if (!registration.userId) {
            return {
              success: false,
              error: 'Supabase signup did not return a user identifier.',
            };
          }

          if (registration.requiresEmailConfirmation) {
            try {
              const supabaseUserId = await authClient.signInWithSupabase(normalizedNewEmail, password);
              if (!supabaseUserId) {
                return {
                  success: false,
                  error: 'Check your email to confirm the account, then sign in.',
                };
              }

              setState((currentState) => authClient.createSession(currentState, supabaseUserId));

              if (authClient.isBackendEnabled()) {
                void refreshBackendSocialState();
              }

              showToast(
                {
                  en: 'Account created successfully.',
                  es: 'Cuenta creada con exito.',
                },
                'success',
              );

              trackEvent('auth_register_succeeded', {
                userId: supabaseUserId,
                username: normalizedNewUsername,
                provider: 'supabase',
              });

              return { success: true };
            } catch (signInAfterSignUpError) {
              const signInMessage = signInAfterSignUpError instanceof Error
                ? signInAfterSignUpError.message.toLowerCase()
                : '';

              if (signInMessage.includes('already registered') || signInMessage.includes('invalid login')) {
                return {
                  success: false,
                  error: 'This email is already registered. Go to login and use your existing password.',
                };
              }
            }

            return {
              success: false,
              error: 'Check your email to confirm the account, then sign in.',
            };
          }

          setState((currentState) => authClient.createSession(currentState, registration.userId!));

          if (authClient.isBackendEnabled()) {
            void refreshBackendSocialState();
          }

          showToast(
            {
              en: 'Account created successfully.',
              es: 'Cuenta creada con exito.',
            },
            'success',
          );

          trackEvent('auth_register_succeeded', {
            userId: registration.userId,
            username: normalizedNewUsername,
            provider: 'supabase',
          });

          return { success: true };
        } catch (caughtError) {
          const errorMessage = caughtError instanceof Error
            ? caughtError.message
            : 'Supabase signup failed.';
          const userAlreadyRegistered = errorMessage.toLowerCase().includes('already registered');

          if (userAlreadyRegistered) {
            try {
              const supabaseUserId = await authClient.signInWithSupabase(normalizedNewEmail, password);
              if (!supabaseUserId) {
                return {
                  success: false,
                  error: 'This email is already registered. Go to login to continue.',
                };
              }

              setState((currentState) => authClient.createSession(currentState, supabaseUserId));

              if (authClient.isBackendEnabled()) {
                void refreshBackendSocialState();
              }

              showToast(
                {
                  en: 'Existing account detected. Session restored.',
                  es: 'Cuenta existente detectada. Sesion restaurada.',
                },
                'info',
              );

              trackEvent('auth_login_succeeded', { userId: supabaseUserId, provider: 'supabase' });
              return { success: true };
            } catch (signInError) {
              reportError(signInError, { scope: 'auth.register.supabase.autoSignIn' });
              return {
                success: false,
                error: 'This email is already registered. Go to login and use your existing password.',
              };
            }
          }

          reportError(caughtError, { scope: 'auth.register.supabase' });

          return {
            success: false,
            error: errorMessage,
          };
        }
      }

      if (!isUsernameAvailable(normalizedNewUsername)) {
        return {
          success: false,
          error: 'That username is already taken.',
        };
      }

      if (state.accounts.some((account) => normalizeEmail(account.email) === normalizedNewEmail)) {
        return {
          success: false,
          error: 'That email is already in use.',
        };
      }

      const userId = createId('user');
      const newUser: User = {
        id: userId,
        name: name.trim(),
        username: normalizedNewUsername,
        email: normalizedNewEmail,
        avatar: DEFAULT_AVATAR_PLACEHOLDER,
        banner: DEFAULT_BANNER_PLACEHOLDER,
        role: {
          en: 'New reader',
          es: 'Nuevo lector',
        },
        bio: {
          en: 'Building a reading identity, one thoughtful shelf at a time.',
          es: 'Construyendo una identidad lectora, un estante cuidado a la vez.',
        },
        location: '',
        website: '',
        profileVisibility: 'public',
        followersCount: 0,
        followingCount: 0,
        booksRead: 0,
        pagesRead: {
          en: '0 pages',
          es: '0 paginas',
        },
        streak: 0,
        favoriteGenres: ['Literary Fiction', 'Fantasy', 'Contemporary'],
        badges: [{ en: 'New reader', es: 'Nuevo lector' }],
        wantToRead: [],
        currentlyReading: [],
        read: [],
        favoriteBooks: [],
        featuredReviews: [],
        activity: [],
      };

      setState((currentState) =>
        authClient.createSession(
          {
            ...currentState,
            users: [...currentState.users, newUser],
            accounts: [
              ...currentState.accounts,
              {
                userId,
                email: normalizedNewEmail,
                password,
              },
            ],
            followingByUser: {
              ...currentState.followingByUser,
              [userId]: [],
            },
          },
          userId,
        ),
      );

      showToast(
        {
          en: 'Account created successfully.',
          es: 'Cuenta creada con exito.',
        },
        'success',
      );

      trackEvent('auth_register_succeeded', { userId, username: normalizedNewUsername });

      return { success: true };
    },
    [
      isUsernameAvailable,
      refreshBackendSocialState,
      showToast,
      state.accounts,
      status,
    ],
  );

  const logout = useCallback(() => {
    if (authClient.isSupabaseAuthEnabled()) {
      void authClient.signOutSupabase().catch((caughtError) => {
        reportError(caughtError, { scope: 'auth.logout.supabase' });
      });
    }

    setState((currentState) => authClient.clearSession(currentState));

    showToast(
      {
        en: 'Session closed.',
        es: 'Sesion cerrada.',
      },
      'info',
    );
    trackEvent('auth_logout');
  }, [showToast]);

  const updateProfile = useCallback(
    async (input: UpdateProfileInput): Promise<AuthActionResult> => {
      if (!currentUser) {
        return {
          success: false,
          error: 'You need to be logged in first.',
        };
      }

      if (!isUsernameAvailable(input.username, currentUser.id)) {
        return {
          success: false,
          error: 'That username is already taken.',
        };
      }

      const normalizedNextEmail = normalizeEmail(input.email);
      if (authClient.isBackendEnabled()) {
        try {
          if (
            authClient.isSupabaseAuthEnabled() &&
            normalizedNextEmail &&
            normalizedNextEmail !== normalizeEmail(currentUser.email)
          ) {
            await authClient.updateSupabaseEmail(normalizedNextEmail);
          }

          const remoteInput: UpdateRemoteProfileInput = {
            locale: input.locale,
            name: input.name.trim(),
            username: normalizeUsername(input.username),
            email: normalizedNextEmail,
            avatar: input.avatar.trim(),
            banner: input.banner.trim(),
            role: input.role.trim(),
            bio: input.bio.trim(),
            location: input.location.trim(),
            website: input.website.trim(),
            profileVisibility: input.profileVisibility,
          };

          const updatedRemoteUser = await authClient.updateMyProfile(currentUser.id, remoteInput);
          setState((currentState) => {
            const existingUser = currentState.users.find((user) => user.id === updatedRemoteUser.id);
            const mergedUser = mergeRemoteUserWithLocal(updatedRemoteUser, existingUser);
            const hasUser = Boolean(existingUser);

            return {
              ...currentState,
              users: hasUser
                ? currentState.users.map((user) =>
                    user.id === mergedUser.id ? mergedUser : user)
                : [mergedUser, ...currentState.users],
              accounts: currentState.accounts.map((account) =>
                account.userId === mergedUser.id
                  ? {
                      ...account,
                      email: normalizedNextEmail,
                    }
                  : account),
            };
          });

          trackEvent('profile_updated', { userId: currentUser.id, provider: 'backend' });
          return { success: true };
        } catch (caughtError) {
          reportError(caughtError, { scope: 'auth.profile.update.backend' });
          return {
            success: false,
            error: caughtError instanceof Error
              ? caughtError.message
              : 'Could not update profile in backend.',
          };
        }
      }

      const emailTaken = state.accounts.some(
        (account) =>
          account.userId !== currentUser.id &&
          normalizeEmail(account.email) === normalizedNextEmail,
      );

      if (emailTaken) {
        return {
          success: false,
          error: 'That email is already in use.',
        };
      }

      setState((currentState) => ({
        ...currentState,
        users: currentState.users.map((user) =>
          user.id === currentUser.id
            ? {
                ...user,
                name: input.name.trim(),
                username: normalizeUsername(input.username),
                email: normalizedNextEmail,
                location: input.location.trim(),
                website: input.website.trim(),
                profileVisibility: input.profileVisibility,
                avatar: input.avatar.trim(),
                banner: input.banner.trim(),
                role: {
                  ...user.role,
                  [input.locale]: input.role.trim() || user.role[input.locale],
                },
                bio: {
                  ...user.bio,
                  [input.locale]: input.bio.trim() || user.bio[input.locale],
                },
              }
            : user,
        ),
        accounts: currentState.accounts.map((account) =>
          account.userId === currentUser.id
            ? {
                ...account,
                email: normalizedNextEmail,
              }
            : account,
          ),
      }));

      trackEvent('profile_updated', { userId: currentUser.id });

      return { success: true };
    },
    [currentUser, isUsernameAvailable, state.accounts],
  );

  const changePassword = useCallback(
    async ({ currentPassword, newPassword }: ChangePasswordInput): Promise<AuthActionResult> => {
      if (!currentUser) {
        return {
          success: false,
          error: 'You need to be logged in first.',
        };
      }

      if (newPassword.trim().length < 6) {
        return {
          success: false,
          error: 'Use at least 6 characters for the new password.',
        };
      }

      if (authClient.isSupabaseAuthEnabled()) {
        if (!currentUser.email?.trim()) {
          return {
            success: false,
            error: 'Current account email is required to validate password change.',
          };
        }

        try {
          await authClient.signInWithSupabase(normalizeEmail(currentUser.email), currentPassword);
          await authClient.updateSupabasePassword(newPassword);
          trackEvent('password_changed', { userId: currentUser.id, provider: 'supabase' });
          return { success: true };
        } catch (caughtError) {
          reportError(caughtError, { scope: 'auth.password.supabase' });
          return {
            success: false,
            error: caughtError instanceof Error
              ? caughtError.message
              : 'Password update failed.',
          };
        }
      }

      const account = state.accounts.find((candidate) => candidate.userId === currentUser.id);

      if (!account || account.password !== currentPassword) {
        return {
          success: false,
          error: 'Your current password does not match.',
        };
      }

      if (newPassword.trim().length < 6) {
        return {
          success: false,
          error: 'Use at least 6 characters for the new password.',
        };
      }

      setState((currentState) => ({
        ...currentState,
        accounts: currentState.accounts.map((candidate) =>
          candidate.userId === currentUser.id
            ? {
                ...candidate,
                password: newPassword,
              }
            : candidate,
        ),
      }));

      trackEvent('password_changed', { userId: currentUser.id });

      return { success: true };
    },
    [currentUser, state.accounts],
  );

  const isFollowingUser = useCallback(
    (userId: string) => {
      if (!currentUser) {
        return false;
      }

      return (state.followingByUser[currentUser.id] ?? []).includes(userId);
    },
    [currentUser, state.followingByUser],
  );

  const hasPendingFollowRequest = useCallback(
    (targetUserId: string) =>
      Boolean(
        currentUser &&
          state.followRequests.find(
            (request) =>
              request.requesterId === currentUser.id &&
              request.targetUserId === targetUserId &&
              request.status === 'pending',
          ),
      ),
    [currentUser, state.followRequests],
  );

  const toggleFollowUser = useCallback(
    (targetUserId: string) => {
      if (!currentUser || currentUser.id === targetUserId) {
        return;
      }

      const targetUser = getUserById(targetUserId);

      if (!targetUser) {
        return;
      }

      const alreadyFollowing = (state.followingByUser[currentUser.id] ?? []).includes(targetUserId);

      if (authClient.isBackendEnabled()) {
        void (async () => {
          try {
            if (alreadyFollowing) {
              const unfollowed = await authClient.unfollowUser(currentUser.id, targetUserId);

              if (!unfollowed) {
                return;
              }

              showToast(
                {
                  en: `You stopped following ${targetUser.name}.`,
                  es: `Dejaste de seguir a ${targetUser.name}.`,
                },
                'info',
              );

              await refreshBackendSocialState();
              return;
            }

            const result = await authClient.followUser(currentUser.id, targetUserId);

            if (result.outcome === 'requested' && result.followRequest) {
              const pendingRequest = result.followRequest;
              setState((currentState) => ({
                ...currentState,
                followRequests: [
                  pendingRequest,
                  ...currentState.followRequests.filter(
                    (request) => request.id !== pendingRequest.id,
                  ),
                ],
              }));

              showToast(
                {
                  en: 'Follow request sent.',
                  es: 'Solicitud de seguimiento enviada.',
                },
                'info',
              );

              await refreshBackendSocialState();
              return;
            }

            if (result.outcome === 'request-already-pending') {
              return;
            }

            if (result.outcome === 'followed' || result.outcome === 'already-following') {
              trackEvent('follow_started', { targetUserId, userId: currentUser.id });
              showToast(
                {
                  en: `You are now following ${targetUser.name}.`,
                  es: `Ahora sigues a ${targetUser.name}.`,
                },
                'success',
              );

              await refreshBackendSocialState();
            }
          } catch (caughtError) {
            reportError(caughtError, { scope: 'social.follow', targetUserId, userId: currentUser.id });
            showToast(
              {
                en: 'Could not update follow state right now.',
                es: 'No se pudo actualizar el seguimiento en este momento.',
              },
              'warning',
            );
          }
        })();

        return;
      }

      if (alreadyFollowing) {
        setState((currentState) => ({
          ...currentState,
          users: adjustFollowCounts(currentState.users, currentUser.id, targetUserId, -1),
          followingByUser: {
            ...currentState.followingByUser,
            [currentUser.id]: (currentState.followingByUser[currentUser.id] ?? []).filter(
              (userId) => userId !== targetUserId,
            ),
          },
        }));

        showToast(
          {
            en: `You stopped following ${targetUser.name}.`,
            es: `Dejaste de seguir a ${targetUser.name}.`,
          },
          'info',
        );
        return;
      }

      if (targetUser.profileVisibility === 'private') {
        if (hasPendingFollowRequest(targetUserId)) {
          return;
        }

        const requestId = createId('request');
        const createdAt = new Date().toISOString();

        setState((currentState) => ({
          ...currentState,
          followRequests: [
            {
              id: requestId,
              requesterId: currentUser.id,
              targetUserId,
              createdAt,
              status: 'pending',
            },
            ...currentState.followRequests,
          ],
          notifications: [
            {
              id: createId('notification'),
              userId: targetUserId,
              type: 'follow-request',
              actorUserId: currentUser.id,
              requestId,
              createdAt,
              read: false,
            },
            ...currentState.notifications,
          ],
        }));

        showToast(
          {
            en: 'Follow request sent.',
            es: 'Solicitud de seguimiento enviada.',
          },
          'info',
        );
        return;
      }

      const createdAt = new Date().toISOString();

      setState((currentState) => ({
        ...currentState,
        users: adjustFollowCounts(currentState.users, currentUser.id, targetUserId, 1),
        followingByUser: {
          ...currentState.followingByUser,
          [currentUser.id]: [targetUserId, ...(currentState.followingByUser[currentUser.id] ?? [])],
        },
        notifications: [
          {
            id: createId('notification'),
            userId: targetUserId,
            type: 'follow',
            actorUserId: currentUser.id,
            createdAt,
            read: false,
          },
          ...currentState.notifications,
        ],
      }));

      trackEvent('follow_started', { targetUserId, userId: currentUser.id });
      showToast(
        {
          en: `You are now following ${targetUser.name}.`,
          es: `Ahora sigues a ${targetUser.name}.`,
        },
        'success',
      );
    },
    [
      currentUser,
      getUserById,
      hasPendingFollowRequest,
      refreshBackendSocialState,
      showToast,
      state.followingByUser,
    ],
  );

  const respondToFollowRequest = useCallback(
    (requestId: string, status: 'accepted' | 'declined') => {
      if (!currentUser) {
        return;
      }

      const request = state.followRequests.find((candidate) => candidate.id === requestId);

      if (!request || request.targetUserId !== currentUser.id || request.status !== 'pending') {
        return;
      }

      if (authClient.isBackendEnabled()) {
        void (async () => {
          try {
            const updatedRequest = await authClient.respondToFollowRequest(currentUser.id, requestId, status);
            if (!updatedRequest) {
              return;
            }

            setState((currentState) => ({
              ...currentState,
              followRequests: currentState.followRequests.map((candidate) =>
                candidate.id === requestId ? updatedRequest : candidate,
              ),
              notifications:
                status === 'accepted'
                  ? [
                      {
                        id: createId('notification'),
                        userId: request.requesterId,
                        type: 'request-approved',
                        actorUserId: currentUser.id,
                        requestId,
                        createdAt: new Date().toISOString(),
                        read: false,
                      },
                      ...currentState.notifications,
                    ]
                  : currentState.notifications,
            }));

            await refreshBackendSocialState();

            showToast(
              status === 'accepted'
                ? {
                    en: 'Follow request accepted.',
                    es: 'Solicitud aceptada.',
                  }
                : {
                    en: 'Follow request declined.',
                    es: 'Solicitud rechazada.',
                  },
              status === 'accepted' ? 'success' : 'info',
            );
          } catch (caughtError) {
            reportError(caughtError, { scope: 'social.followRequest.respond', requestId, status });
            showToast(
              {
                en: 'Could not respond to the follow request.',
                es: 'No se pudo responder la solicitud de seguimiento.',
              },
              'warning',
            );
          }
        })();

        return;
      }

      setState((currentState) => {
        const nextUsers =
          status === 'accepted'
            ? adjustFollowCounts(currentState.users, request.requesterId, currentUser.id, 1)
            : currentState.users;

        return {
          ...currentState,
          users: nextUsers,
          followingByUser:
            status === 'accepted'
              ? {
                  ...currentState.followingByUser,
                  [request.requesterId]: [
                    currentUser.id,
                    ...(currentState.followingByUser[request.requesterId] ?? []).filter(
                      (userId) => userId !== currentUser.id,
                    ),
                  ],
                }
              : currentState.followingByUser,
          followRequests: currentState.followRequests.map((candidate) =>
            candidate.id === requestId ? { ...candidate, status } : candidate,
          ),
          notifications: [
            {
              id: createId('notification'),
              userId: request.requesterId,
              type: 'request-approved',
              actorUserId: currentUser.id,
              requestId,
              createdAt: new Date().toISOString(),
              read: false,
            },
            ...currentState.notifications,
          ],
        };
      });

      showToast(
        status === 'accepted'
          ? {
              en: 'Follow request accepted.',
              es: 'Solicitud aceptada.',
            }
          : {
              en: 'Follow request declined.',
              es: 'Solicitud rechazada.',
            },
        status === 'accepted' ? 'success' : 'info',
      );
    },
    [currentUser, refreshBackendSocialState, showToast, state.followRequests],
  );

  const createReview = useCallback(
    async (input: {
      bookId: string;
      rating: number;
      title: string;
      excerpt: string;
      body: string;
    }): Promise<AuthActionResult> => {
      if (!currentUser) {
        return {
          success: false,
          error: 'You need an active session to publish a review.',
        };
      }

      if (state.reviews.some((review) => review.bookId === input.bookId && review.userId === currentUser.id)) {
        return {
          success: false,
          error: 'You already published a review for this book.',
        };
      }

      const timestamp = new Date().toISOString();

      setState((currentState) => ({
        ...currentState,
        reviews: [
          {
            id: createId('review'),
            bookId: input.bookId,
            userId: currentUser.id,
            rating: input.rating,
            title: { en: input.title.trim(), es: input.title.trim() },
            excerpt: { en: input.excerpt.trim(), es: input.excerpt.trim() },
            body: { en: input.body.trim(), es: input.body.trim() },
            likes: 0,
            comments: 0,
            likedBy: [],
            commentItems: [],
            createdAt: localizeNow(),
          },
          ...currentState.reviews,
        ],
        users: updateUserActivity(currentState.users, currentUser.id, (activity) => [
          {
            id: createId('activity'),
            type: 'review',
            content: { en: 'Published a new review', es: 'Publico una nueva resena' },
            bookId: input.bookId,
            createdAt: localizeNow(),
            timestamp,
            likes: 0,
            comments: 0,
            likedBy: [],
            commentItems: [],
          },
          ...activity,
        ]),
      }));

      trackEvent('review_created', { bookId: input.bookId, userId: currentUser.id });

      return { success: true };
    },
    [currentUser, state.reviews],
  );

  const toggleLikeReview = useCallback(
    (reviewId: string) => {
      if (!currentUser) {
        return;
      }

      setState((currentState) => ({
        ...currentState,
        reviews: currentState.reviews.map((review) => {
          if (review.id !== reviewId) {
            return review;
          }

          const likedBy = review.likedBy ?? [];
          const hasLiked = likedBy.includes(currentUser.id);

          return {
            ...review,
            likes: Math.max(0, review.likes + (hasLiked ? -1 : 1)),
            likedBy: hasLiked
              ? likedBy.filter((userId) => userId !== currentUser.id)
              : [currentUser.id, ...likedBy],
          };
        }),
      }));
    },
    [currentUser],
  );

  const addCommentToReview = useCallback(
    (reviewId: string, body: string) => {
      if (!currentUser || !body.trim()) {
        return;
      }

      const comment: SocialComment = {
        id: createId('comment'),
        userId: currentUser.id,
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };

      setState((currentState) => ({
        ...currentState,
        reviews: currentState.reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                comments: review.comments + 1,
                commentItems: [...(review.commentItems ?? []), comment],
              }
            : review,
        ),
      }));
    },
    [currentUser],
  );

  const toggleLikeActivity = useCallback(
    (activityId: string) => {
      if (!currentUser) {
        return;
      }

      setState((currentState) => ({
        ...currentState,
        users: currentState.users.map((user) => ({
          ...user,
          activity: user.activity.map((activity) => {
            if (activity.id !== activityId) {
              return activity;
            }

            const likedBy = activity.likedBy ?? [];
            const hasLiked = likedBy.includes(currentUser.id);

            return {
              ...activity,
              likes: Math.max(0, (activity.likes ?? 0) + (hasLiked ? -1 : 1)),
              likedBy: hasLiked
                ? likedBy.filter((userId) => userId !== currentUser.id)
                : [currentUser.id, ...likedBy],
            };
          }),
        })),
      }));
    },
    [currentUser],
  );

  const addCommentToActivity = useCallback(
    (activityId: string, body: string) => {
      if (!currentUser || !body.trim()) {
        return;
      }

      const comment: SocialComment = {
        id: createId('comment'),
        userId: currentUser.id,
        body: body.trim(),
        createdAt: new Date().toISOString(),
      };

      setState((currentState) => ({
        ...currentState,
        users: currentState.users.map((user) => ({
          ...user,
          activity: user.activity.map((activity) =>
            activity.id === activityId
              ? {
                  ...activity,
                  comments: (activity.comments ?? 0) + 1,
                  commentItems: [...(activity.commentItems ?? []), comment],
                }
              : activity,
          ),
        })),
      }));
    },
    [currentUser],
  );

  const getConversationWith = useCallback(
    (partnerUserId: string) => {
      if (!currentUser) {
        return undefined;
      }

      return state.conversations.find(
        (conversation) =>
          conversation.participantIds.includes(currentUser.id) &&
          conversation.participantIds.includes(partnerUserId),
      );
    },
    [currentUser, state.conversations],
  );

  const openConversation = useCallback(
    (partnerUserId: string) => {
      if (!currentUser || partnerUserId === currentUser.id) {
        return;
      }

      setState((currentState) => {
        const existingConversation = currentState.conversations.find(
          (conversation) =>
            conversation.participantIds.includes(currentUser.id) &&
            conversation.participantIds.includes(partnerUserId),
        );

        if (existingConversation) {
          return currentState;
        }

        return {
          ...currentState,
          conversations: [
            {
              id: createId('conversation'),
              participantIds: [currentUser.id, partnerUserId],
              updatedAt: new Date().toISOString(),
              messages: [],
            },
            ...currentState.conversations,
          ],
        };
      });

      trackEvent('message_sent', { partnerUserId, userId: currentUser.id });
    },
    [currentUser],
  );

  const markConversationAsSeen = useCallback(
    (conversationId: string) => {
      if (!currentUser) {
        return;
      }

      setState((currentState) => ({
        ...currentState,
        conversations: currentState.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                messages: conversation.messages.map((message) =>
                  message.senderId !== currentUser.id
                    ? {
                        ...message,
                        status: 'seen',
                      }
                    : message,
                ),
              }
            : conversation,
        ),
      }));
    },
    [currentUser],
  );

  const sendMessage = useCallback(
    (partnerUserId: string, body: string) => {
      if (!currentUser || !body.trim()) {
        return;
      }

      const timestamp = new Date().toISOString();
      const trimmedBody = body.trim();

      setState((currentState) => {
        const existingConversation = currentState.conversations.find(
          (conversation) =>
            conversation.participantIds.includes(currentUser.id) &&
            conversation.participantIds.includes(partnerUserId),
        );

        const conversationId = existingConversation?.id ?? createId('conversation');
        const message = {
          id: createId('message'),
          conversationId,
          senderId: currentUser.id,
          body: trimmedBody,
          createdAt: timestamp,
          status: 'sent' as const,
        };

        const conversations = existingConversation
          ? currentState.conversations.map((conversation) =>
              conversation.id === conversationId
                ? {
                    ...conversation,
                    updatedAt: timestamp,
                    messages: [...conversation.messages, message],
                  }
                : conversation,
            )
          : [
              {
                id: conversationId,
                participantIds: [currentUser.id, partnerUserId] as [string, string],
                updatedAt: timestamp,
                messages: [message],
              },
              ...currentState.conversations,
            ];

        return {
          ...currentState,
          conversations,
          notifications: [
            {
              id: createId('notification'),
              userId: partnerUserId,
              type: 'message',
              actorUserId: currentUser.id,
              message: trimmedBody,
              createdAt: timestamp,
              read: false,
            },
            ...currentState.notifications,
          ],
        };
      });
    },
    [currentUser],
  );

  const markNotificationsAsRead = useCallback(() => {
    if (!currentUser) {
      return;
    }

    setState((currentState) => ({
      ...currentState,
      notifications: currentState.notifications.map((notification) =>
        notification.userId === currentUser.id
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    }));
  }, [currentUser]);

  const featuredReviews = useMemo(
    () => state.reviews.filter((review) => review.featured),
    [state.reviews],
  );
  const topReviewers = useMemo(() => state.users.slice(0, 4), [state.users]);
  const activityFeed = useMemo(
    () =>
      state.users
        .flatMap((user) =>
          user.activity.map(
            (activity): FeedActivityItem => ({
              ...activity,
              userId: user.id,
              likedBy: [...(activity.likedBy ?? [])],
              commentItems: [...(activity.commentItems ?? [])],
            }),
          ),
        )
        .sort(
          (leftActivity, rightActivity) =>
            new Date(rightActivity.timestamp).getTime() -
            new Date(leftActivity.timestamp).getTime(),
        ),
    [state.users],
  );
  const notifications = useMemo(
    () =>
      mergeDerivedFollowRequestNotifications(
        state.notifications,
        state.followRequests,
        currentUser?.id ?? null,
      ),
    [currentUser?.id, state.followRequests, state.notifications],
  );
  const unreadMessagesCount = useMemo(() => {
    if (!currentUser) {
      return 0;
    }

    return state.conversations
      .filter((conversation) => conversation.participantIds.includes(currentUser.id))
      .reduce(
        (total, conversation) =>
          total +
          conversation.messages.filter(
            (message) => message.senderId !== currentUser.id && message.status === 'sent',
          ).length,
        0,
      );
  }, [currentUser, state.conversations]);
  const unreadNotificationsCount = useMemo(() => {
    if (!currentUser) {
      return 0;
    }

    return notifications.filter(
      (notification) => notification.userId === currentUser.id && !notification.read,
    ).length;
  }, [currentUser, notifications]);

  const value = useMemo<AuthContextValue>(
    () => ({
      currentUser,
      error,
      isAuthenticated,
      retry,
      status,
      users: state.users,
      reviews: state.reviews,
      featuredReviews,
      topReviewers,
      activityFeed,
      conversations: state.conversations,
      followRequests: state.followRequests,
      notifications,
      unreadMessagesCount,
      unreadNotificationsCount,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      isUsernameAvailable,
      getUserById,
      getUserByUsername,
      getReviewsForBook,
      getReviewsForUser,
      getFollowersForUser,
      getFollowingForUser,
      isFollowingUser,
      hasPendingFollowRequest,
      toggleFollowUser,
      respondToFollowRequest,
      createReview,
      toggleLikeReview,
      addCommentToReview,
      toggleLikeActivity,
      addCommentToActivity,
      getConversationWith,
      openConversation,
      markConversationAsSeen,
      sendMessage,
      markNotificationsAsRead,
    }),
    [
      activityFeed,
      addCommentToActivity,
      addCommentToReview,
      createReview,
      currentUser,
      error,
      featuredReviews,
      getConversationWith,
      getFollowersForUser,
      getFollowingForUser,
      getReviewsForBook,
      getReviewsForUser,
      getUserById,
      getUserByUsername,
      hasPendingFollowRequest,
      isAuthenticated,
      isFollowingUser,
      isUsernameAvailable,
      login,
      logout,
      changePassword,
      markConversationAsSeen,
      markNotificationsAsRead,
      openConversation,
      register,
      retry,
      respondToFollowRequest,
      sendMessage,
      state.conversations,
      state.followRequests,
      notifications,
      state.reviews,
      state.users,
      toggleFollowUser,
      toggleLikeActivity,
      toggleLikeReview,
      topReviewers,
      unreadMessagesCount,
      unreadNotificationsCount,
      updateProfile,
      status,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};

