import { browserStorage } from '@/services/storage/browserStorage';

const defaultSupabaseUrl = '';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? defaultSupabaseUrl)
  .trim()
  .replace(/\/$/, '');

const supabasePublishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

const useSupabaseAuth = (import.meta.env.VITE_USE_SUPABASE_AUTH ?? 'false').toLowerCase() === 'true';

const sessionStorageKey = 'goodreads-supabase-session';

export interface SupabaseUser {
  id: string;
  email: string | null;
  user_metadata?: Record<string, unknown>;
}

export interface SupabaseAuthSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at?: number;
  token_type: string;
  user: SupabaseUser;
}

interface SupabaseAuthResponse {
  session: SupabaseAuthSession | null;
  user: SupabaseUser | null;
}

interface SupabaseUpdateUserResponse {
  user: SupabaseUser | null;
}

const isEnabled = () => useSupabaseAuth && Boolean(supabaseUrl) && Boolean(supabasePublishableKey);

const resolveExpiresAt = (session: SupabaseAuthSession): number => {
  if (typeof session.expires_at === 'number' && Number.isFinite(session.expires_at)) {
    return session.expires_at;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return nowInSeconds + Math.max(0, session.expires_in ?? 0);
};

const persistSession = (session: SupabaseAuthSession | null) => {
  if (!session) {
    browserStorage.remove(sessionStorageKey);
    return;
  }

  const normalized: SupabaseAuthSession = {
    ...session,
    expires_at: resolveExpiresAt(session),
  };

  browserStorage.setJSON(sessionStorageKey, normalized);
};

const readPersistedSession = (): SupabaseAuthSession | null => {
  const session = browserStorage.getJSON<SupabaseAuthSession>(sessionStorageKey);

  if (!session?.access_token || !session.refresh_token || !session.user?.id) {
    return null;
  }

  return session;
};

const createHeaders = (accessToken?: string, withBody = false): HeadersInit => {
  const headers: Record<string, string> = {
    apikey: supabasePublishableKey,
    Accept: 'application/json',
  };

  if (withBody) {
    headers['Content-Type'] = 'application/json';
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

const readJson = async <T>(response: Response): Promise<T | null> => {
  const payload = await response.text();
  if (!payload.trim()) {
    return null;
  }

  return JSON.parse(payload) as T;
};

const requestSession = async (
  path: string,
  body: object,
): Promise<SupabaseAuthResponse> => {
  const response = await fetch(`${supabaseUrl}${path}`, {
    method: 'POST',
    headers: createHeaders(undefined, true),
    body: JSON.stringify(body),
  });

  const payload = await readJson<SupabaseAuthResponse>(response);

  if (!response.ok) {
    const errorMessage =
      (payload as { msg?: string; error_description?: string } | null)?.error_description ??
      (payload as { msg?: string; error_description?: string } | null)?.msg ??
      `Supabase auth request failed (${response.status}).`;

    throw new Error(errorMessage);
  }

  const result = payload ?? { session: null, user: null };
  persistSession(result.session);
  return result;
};

const refreshSession = async (refreshToken: string): Promise<SupabaseAuthSession | null> => {
  const response = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=refresh_token`, {
    method: 'POST',
    headers: createHeaders(undefined, true),
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  const payload = await readJson<SupabaseAuthResponse>(response);

  if (!response.ok) {
    persistSession(null);
    return null;
  }

  const session = payload?.session ?? null;
  persistSession(session);
  return session;
};

const getValidSession = async (): Promise<SupabaseAuthSession | null> => {
  const session = readPersistedSession();
  if (!session) {
    return null;
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = session.expires_at ?? resolveExpiresAt(session);
  const isExpired = expiresAt <= nowInSeconds + 30;

  if (!isExpired) {
    return session;
  }

  return refreshSession(session.refresh_token);
};

export const supabaseAuth = {
  isEnabled,
  async restoreSession() {
    if (!isEnabled()) {
      return null;
    }

    return getValidSession();
  },
  getAccessToken() {
    if (!isEnabled()) {
      return null;
    }

    const session = readPersistedSession();
    return session?.access_token ?? null;
  },
  getCurrentUserId() {
    if (!isEnabled()) {
      return null;
    }

    const session = readPersistedSession();
    return session?.user.id ?? null;
  },
  getSessionUser() {
    if (!isEnabled()) {
      return null;
    }

    const session = readPersistedSession();
    return session?.user ?? null;
  },
  async signInWithPassword(email: string, password: string) {
    if (!isEnabled()) {
      throw new Error('Supabase auth is not enabled.');
    }

    return requestSession('/auth/v1/token?grant_type=password', { email, password });
  },
  async signUp(email: string, password: string, metadata: Record<string, unknown>) {
    if (!isEnabled()) {
      throw new Error('Supabase auth is not enabled.');
    }

    return requestSession('/auth/v1/signup', {
      email,
      password,
      data: metadata,
    });
  },
  async signOut() {
    if (!isEnabled()) {
      persistSession(null);
      return;
    }

    const accessToken = readPersistedSession()?.access_token;

    if (!accessToken) {
      persistSession(null);
      return;
    }

    await fetch(`${supabaseUrl}/auth/v1/logout`, {
      method: 'POST',
      headers: createHeaders(accessToken),
    });

    persistSession(null);
  },
  async updateUser(input: { email?: string; password?: string }) {
    if (!isEnabled()) {
      throw new Error('Supabase auth is not enabled.');
    }

    const session = await getValidSession();
    if (!session?.access_token) {
      throw new Error('No active Supabase session.');
    }

    const payloadInput: Record<string, string> = {};
    if (input.email?.trim()) {
      payloadInput.email = input.email.trim();
    }

    if (input.password?.trim()) {
      payloadInput.password = input.password.trim();
    }

    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: 'PUT',
      headers: createHeaders(session.access_token, true),
      body: JSON.stringify(payloadInput),
    });

    const payload = await readJson<SupabaseUpdateUserResponse>(response);
    if (!response.ok) {
      const errorMessage =
        (payload as { msg?: string; error_description?: string } | null)?.error_description ??
        (payload as { msg?: string; error_description?: string } | null)?.msg ??
        `Supabase update user failed (${response.status}).`;

      throw new Error(errorMessage);
    }

    if (payload?.user) {
      persistSession({
        ...session,
        user: payload.user,
      });
    }
  },
};
