import {
  clearIdentifiedUser,
  identifyUser,
  reportError,
  setMonitoringAdapter,
  trackEvent,
  type MonitoringAdapter,
} from './reporting';

describe('reporting service', () => {
  const adapter: MonitoringAdapter = {
    clearUser: vi.fn(),
    identifyUser: vi.fn(),
    reportError: vi.fn(),
    trackEvent: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setMonitoringAdapter(adapter);
  });

  it('forwards tracked events with base metadata', () => {
    trackEvent('page_viewed', { path: '/library' });

    expect(adapter.trackEvent).toHaveBeenCalledWith(
      'page_viewed',
      expect.objectContaining({
        app: 'goodreads-frontend',
        path: '/library',
      }),
    );
  });

  it('forwards reported errors and user identification', () => {
    const error = new Error('boom');

    reportError(error, { scope: 'test' });
    identifyUser({ id: 'user-1', username: 'reader' });
    clearIdentifiedUser();

    expect(adapter.reportError).toHaveBeenCalledWith(
      error,
      expect.objectContaining({
        app: 'goodreads-frontend',
        scope: 'test',
      }),
    );
    expect(adapter.identifyUser).toHaveBeenCalledWith({ id: 'user-1', username: 'reader' });
    expect(adapter.clearUser).toHaveBeenCalled();
  });
});
