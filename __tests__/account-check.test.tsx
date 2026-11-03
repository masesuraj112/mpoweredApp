// The screen shown after a correct code when the number doesn't match what the person started
// (docs/backend/sign-up-sign-in-plan.md, SU-2 to SU-4).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AccountCheckScreen from '../app/(auth)/account-check';

jest.setTimeout(60000);

const mockReplace = jest.fn();
const mockHoldSignIn = jest.fn();
const mockUpdateData = jest.fn();
const mockSignOut = jest.fn();
let mockReason = 'account-exists';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-router', () => ({
  router: { replace: (href: unknown) => mockReplace(href) },
  useLocalSearchParams: () => ({ reason: mockReason }),
}));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ holdSignIn: mockHoldSignIn }) }));
jest.mock('@/context/Onboarding-Context', () => ({
  useOnboarding: () => ({ data: { phoneNumber: '0491570006' }, updateData: mockUpdateData }),
}));
jest.mock('@/services/auth', () => ({ signOut: () => mockSignOut() }));

const metrics = { frame: { x: 0, y: 0, width: 360, height: 780 }, insets: { top: 24, left: 0, right: 0, bottom: 24 } };

async function setup(reason: string) {
  mockReason = reason;
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <AccountCheckScreen />
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSignOut.mockResolvedValue({ ok: true, data: undefined });
});

describe('AccountCheckScreen: the number already has an account', () => {
  it('says so, with the number, and that the answers are not saved', async () => {
    await setup('account-exists');

    expect(screen.getByRole('header', { name: 'You already have an account' })).toBeTruthy();
    expect(screen.getByText(/account for 0491 570 006\. The answers you just gave won’t be saved\./)).toBeTruthy();
  });

  it('Sign in to my account releases the hold so the app opens the account', async () => {
    await setup('account-exists');

    fireEvent.press(screen.getByRole('button', { name: 'Sign in to my account' }));

    expect(mockHoldSignIn).toHaveBeenCalledWith(false);
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});

describe('AccountCheckScreen: the number has no account', () => {
  it('says so, with the number', async () => {
    await setup('no-account');

    expect(screen.getByRole('header', { name: 'No account found' })).toBeTruthy();
    expect(screen.getByText('We couldn’t find an MPowered account for 0491 570 006.')).toBeTruthy();
  });

  it('Create an account switches to sign-up and asks the sign-up questions', async () => {
    await setup('no-account');

    fireEvent.press(screen.getByRole('button', { name: 'Create an account' }));

    expect(mockUpdateData).toHaveBeenCalledWith({ intent: 'sign-up' });
    expect(mockReplace).toHaveBeenCalledWith('/(auth)/user-type');
  });
});

describe('AccountCheckScreen: Use a different number', () => {
  it.each(['account-exists', 'no-account'])('signs out and returns to the phone screen (%s)', async (reason) => {
    await setup(reason);

    fireEvent.press(screen.getByRole('button', { name: 'Use a different number' }));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/phone'));
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('stays and explains when signing out fails', async () => {
    mockSignOut.mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'offline' } });
    await setup('account-exists');

    fireEvent.press(screen.getByRole('button', { name: 'Use a different number' }));

    expect(await screen.findByText(/We could not sign you out/)).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
