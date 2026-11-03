/* global jest */
// Lets modules that import @/lib/supabase load without real credentials.
process.env.EXPO_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'test-key';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// No native notifications module under Jest: the real hook crashes reading a tap that isn't there.
// A phone with no tapped notification returns null, so do the same. Everything else stays real.
jest.mock('expo-notifications', () => ({
  ...jest.requireActual('expo-notifications'),
  useLastNotificationResponse: () => null,
}));
