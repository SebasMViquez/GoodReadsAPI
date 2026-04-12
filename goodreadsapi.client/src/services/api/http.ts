const defaultApiBaseUrl = import.meta.env.DEV ? 'http://localhost:5068' : '';

export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? defaultApiBaseUrl)
  .trim()
  .replace(/\/$/, '');

export const useMockApi = (import.meta.env.VITE_USE_MOCK_API ?? 'false').toLowerCase() === 'true';

export const isBackendApiEnabled = () => !useMockApi && Boolean(apiBaseUrl);

export const buildApiUrl = (path: string) => `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
