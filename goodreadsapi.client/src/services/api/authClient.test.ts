import { authClient } from './authClient';

describe('authClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.localStorage.removeItem('goodreads-session-token');
  });

  it('hydrates seeded state when there is no persisted snapshot', async () => {
    const state = await authClient.hydrate();

    expect(state.users.length).toBeGreaterThan(0);
    expect(state.accounts.length).toBeGreaterThan(0);
  });

  it('persists state snapshots that can be hydrated later', async () => {
    const state = authClient.createInitialState();

    await authClient.persist(state);

    expect(window.localStorage.getItem('goodreads-auth-state')).toBeTruthy();

    const hydratedState = await authClient.hydrate();
    expect(hydratedState.users).toHaveLength(state.users.length);
  });
});
