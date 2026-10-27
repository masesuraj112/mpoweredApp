import { act, renderRouter, screen, waitFor } from 'expo-router/testing-library';

jest.setTimeout(60000);

// Dev-only switch that opens every route without a Supabase session (read when app/_layout loads).
process.env.EXPO_PUBLIC_BYPASS_AUTH = 'true';

// The health screens open the database when they load, which has no native module under Jest.
const makeDb = (): unknown =>
  new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (prop === 'withTransactionSync') return (run: () => unknown) => run();
        if (prop === 'withTransactionAsync') return async (run: () => unknown) => run();
        if (prop === 'then') return undefined;
        return jest.fn(() => []);
      },
    },
  );
jest.mock('expo-sqlite', () => ({
  openDatabaseSync: () => makeDb(),
  openDatabaseAsync: async () => makeDb(),
  SQLiteProvider: ({ children }: { children: unknown }) => children,
  useSQLiteContext: () => makeDb(),
}));

// The tracker group has no tab of its own. Hiding it the wrong way left every /tracker/* route
// unreachable, so pressing Record on Home did nothing.
describe('tracker routes opened from Home', () => {
  it.each([
    '/tracker/pain/location',
    '/tracker/movement/activity',
    '/tracker/personal-care/general',
    '/tracker/social-health/social-life',
    '/tracker/management/medication',
    '/tracker/reflection',
  ])('%s opens', async path => {
    const { router } = require('expo-router');
    await renderRouter('./app', { initialUrl: '/home' });
    await waitFor(() => expect(screen.getByLabelText('Record My Pain')).toBeEnabled(), { timeout: 5000 });

    await act(async () => {
      router.push(path);
    });

    await waitFor(() => expect(screen).toHavePathname(path), { timeout: 3000 });
  });
});
