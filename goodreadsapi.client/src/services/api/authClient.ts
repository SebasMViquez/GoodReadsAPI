import {
  clearCurrentSession,
  createDefaultAuthState,
  createSessionForUser,
  loadPersistedAuthState,
  resolveCurrentUserId,
  savePersistedAuthState,
  type AuthState,
} from '@/services/api/mock/authState';
import { buildApiUrl, isBackendApiEnabled } from '@/services/api/http';
import type { FollowRequest, LocalizedText } from '@/types';

export interface RemoteUserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  banner: string;
  role: LocalizedText;
  bio: LocalizedText;
  location: string;
  website: string;
  profileVisibility: 'public' | 'private';
  followersCount: number;
  followingCount: number;
  booksRead: number;
  pagesRead: LocalizedText;
  streak: number;
  favoriteGenres: string[];
  badges: LocalizedText[];
}

export interface FollowUserResult {
  outcome: string;
  followRequest: FollowRequest | null;
}

export interface AuthClient {
  createInitialState: () => AuthState;
  createSession: (state: AuthState, userId: string) => AuthState;
  hydrate: () => Promise<AuthState>;
  persist: (state: AuthState) => Promise<void>;
  resolveCurrentUserId: (state: AuthState) => string | null;
  clearSession: (state: AuthState) => AuthState;
  isBackendEnabled: () => boolean;
  fetchUsers: (query?: string, visibility?: string) => Promise<RemoteUserProfile[]>;
  fetchFollowingUserIds: (userId: string) => Promise<string[]>;
  followUser: (currentUserId: string, targetUserId: string) => Promise<FollowUserResult>;
  unfollowUser: (currentUserId: string, targetUserId: string) => Promise<boolean>;
  fetchPendingFollowRequests: (currentUserId: string) => Promise<FollowRequest[]>;
  respondToFollowRequest: (
    currentUserId: string,
    requestId: string,
    status: 'accepted' | 'declined',
  ) => Promise<FollowRequest | null>;
}

interface RemoteFollowRequestResponse {
  id: string;
  requesterId: string;
  targetUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

interface RemoteFollowOperationResponse {
  outcome: string;
  followRequest?: RemoteFollowRequestResponse | null;
}

const readJsonSafely = async <T>(response: Response): Promise<T | null> => {
  const text = await response.text();
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as T;
};

const mapFollowRequest = (value: RemoteFollowRequestResponse): FollowRequest => ({
  id: value.id,
  requesterId: value.requesterId,
  targetUserId: value.targetUserId,
  status: value.status,
  createdAt: value.createdAt,
});

const createAuthHeaders = (currentUserId?: string): HeadersInit => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (currentUserId) {
    headers['X-User-Id'] = currentUserId;
  }

  return headers;
};

const fetchJson = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(buildApiUrl(path), init);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${path}`);
  }

  const payload = await readJsonSafely<T>(response);
  if (payload === null) {
    throw new Error(`Expected JSON payload for ${path}`);
  }

  return payload;
};

export const authClient: AuthClient = {
  createInitialState: createDefaultAuthState,
  createSession: createSessionForUser,
  async hydrate() {
    return loadPersistedAuthState();
  },
  async persist(state) {
    savePersistedAuthState(state);
  },
  resolveCurrentUserId,
  clearSession: clearCurrentSession,
  isBackendEnabled: isBackendApiEnabled,
  async fetchUsers(query, visibility) {
    const queryParams = new URLSearchParams();
    if (query?.trim()) {
      queryParams.set('query', query.trim());
    }

    if (visibility?.trim()) {
      queryParams.set('visibility', visibility.trim());
    }

    const queryString = queryParams.toString();
    const path = `/api/users${queryString ? `?${queryString}` : ''}`;
    return fetchJson<RemoteUserProfile[]>(path, {
      headers: createAuthHeaders(),
    });
  },
  async fetchFollowingUserIds(userId) {
    const users = await fetchJson<RemoteUserProfile[]>(`/api/users/${encodeURIComponent(userId)}/following`, {
      headers: createAuthHeaders(),
    });

    return users.map((user) => user.id);
  },
  async followUser(currentUserId, targetUserId) {
    const response = await fetch(buildApiUrl(`/api/users/${encodeURIComponent(targetUserId)}/follow`), {
      method: 'POST',
      headers: createAuthHeaders(currentUserId),
    });

    if (!response.ok) {
      throw new Error(`Follow request failed (${response.status}).`);
    }

    const payload = await readJsonSafely<RemoteFollowOperationResponse>(response);

    return {
      outcome: payload?.outcome ?? 'unknown',
      followRequest: payload?.followRequest ? mapFollowRequest(payload.followRequest) : null,
    };
  },
  async unfollowUser(currentUserId, targetUserId) {
    const response = await fetch(buildApiUrl(`/api/users/${encodeURIComponent(targetUserId)}/follow`), {
      method: 'DELETE',
      headers: createAuthHeaders(currentUserId),
    });

    if (response.status === 404) {
      return false;
    }

    if (!response.ok) {
      throw new Error(`Unfollow request failed (${response.status}).`);
    }

    return true;
  },
  async fetchPendingFollowRequests(currentUserId) {
    const requests = await fetchJson<RemoteFollowRequestResponse[]>('/api/me/follow-requests', {
      headers: createAuthHeaders(currentUserId),
    });

    return requests.map(mapFollowRequest);
  },
  async respondToFollowRequest(currentUserId, requestId, status) {
    const actionPath = status === 'accepted' ? 'accept' : 'decline';
    const response = await fetch(
      buildApiUrl(`/api/me/follow-requests/${encodeURIComponent(requestId)}/${actionPath}`),
      {
        method: 'POST',
        headers: createAuthHeaders(currentUserId),
      },
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Respond follow request failed (${response.status}).`);
    }

    const payload = await readJsonSafely<RemoteFollowRequestResponse>(response);
    return payload ? mapFollowRequest(payload) : null;
  },
};
