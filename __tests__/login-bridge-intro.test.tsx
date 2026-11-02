// After the profile is made, only a new patient sees the "You're off to an MPowered start" slides.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import LoginBridgeScreen from '../app/(auth)/login-bridge';

jest.setTimeout(60000);

const mockReplace = jest.fn();
const mockRefreshProfile = jest.fn();
const mockCreateProfile = jest.fn();
let mockUserType: 'patient' | 'support-person' = 'patient';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-router', () => ({ router: { replace: (href: unknown) => mockReplace(href), push: jest.fn() } }));
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ session: { user: { phone: '61491570006' } }, refreshProfile: mockRefreshProfile }),
}));
jest.mock('@/context/Onboarding-Context', () => ({
  useOnboarding: () => ({ data: { name: 'Sam Lee', userType: mockUserType, phoneNumber: '0491570006' } }),
}));
jest.mock('@/services/profile', () => ({ createProfile: (...args: unknown[]) => mockCreateProfile(...args) }));

const metrics = { frame: { x: 0, y: 0, width: 412, height: 915 }, insets: { top: 24, left: 0, right: 0, bottom: 24 } };

async function finish(userType: 'patient' | 'support-person') {
  mockUserType = userType;
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <LoginBridgeScreen />
    </SafeAreaProvider>,
  );
  fireEvent.press(screen.getByText('Continue'));
  await waitFor(() => expect(mockCreateProfile).toHaveBeenCalled());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateProfile.mockResolvedValue({ ok: true, data: undefined });
});

describe('LoginBridgeScreen after the profile is made', () => {
  it('shows a new patient the intro slides', async () => {
    await finish('patient');

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/verification-confirmation'));
    expect(mockRefreshProfile).not.toHaveBeenCalled();
  });

  it('takes a new support person straight to their app', async () => {
    await finish('support-person');

    await waitFor(() => expect(mockRefreshProfile).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
