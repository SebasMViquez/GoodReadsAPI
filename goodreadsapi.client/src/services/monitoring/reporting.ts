type TrackingPayload = Record<string, unknown>;

interface IdentifyPayload {
  email?: string;
  id: string;
  locale?: string;
  username?: string;
}

export interface MonitoringAdapter {
  clearUser?: () => void;
  identifyUser?: (payload: IdentifyPayload) => void;
  reportError: (error: unknown, context?: TrackingPayload) => void;
  trackEvent: (name: string, payload?: TrackingPayload) => void;
}

const isDevelopment = import.meta.env.DEV;
const monitoringProvider = import.meta.env.VITE_MONITORING_PROVIDER ?? 'console';

const createConsoleMonitoringAdapter = (): MonitoringAdapter => ({
  clearUser() {
    if (isDevelopment) {
      console.info('[tracking] clearUser');
    }
  },
  identifyUser(payload) {
    if (isDevelopment) {
      console.info('[tracking] identifyUser', payload);
    }
  },
  reportError(error, context = {}) {
    if (isDevelopment) {
      console.error('[reportError]', error, context);
    }
  },
  trackEvent(name, payload = {}) {
    if (isDevelopment) {
      console.info('[tracking]', name, payload);
    }
  },
});

const createNoopMonitoringAdapter = (): MonitoringAdapter => ({
  reportError() {},
  trackEvent() {},
});

let monitoringAdapter: MonitoringAdapter =
  monitoringProvider === 'console' || isDevelopment
    ? createConsoleMonitoringAdapter()
    : createNoopMonitoringAdapter();

export const setMonitoringAdapter = (adapter: MonitoringAdapter) => {
  monitoringAdapter = adapter;
};

const withBaseContext = (payload: TrackingPayload = {}) => ({
  ...payload,
  app: 'goodreads-frontend',
  env: import.meta.env.MODE,
});

export const trackEvent = (name: string, payload: TrackingPayload = {}) => {
  monitoringAdapter.trackEvent(name, withBaseContext(payload));
};

export const reportError = (error: unknown, context: TrackingPayload = {}) => {
  monitoringAdapter.reportError(error, withBaseContext(context));
};

export const identifyUser = (payload: IdentifyPayload) => {
  monitoringAdapter.identifyUser?.(payload);
};

export const clearIdentifiedUser = () => {
  monitoringAdapter.clearUser?.();
};

export const installGlobalErrorReporting = () => {
  const handleError = (event: ErrorEvent) => {
    reportError(event.error ?? event.message, { type: 'window.error' });
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    reportError(event.reason, { type: 'window.unhandledrejection' });
  };

  window.addEventListener('error', handleError);
  window.addEventListener('unhandledrejection', handleRejection);

  return () => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleRejection);
  };
};
