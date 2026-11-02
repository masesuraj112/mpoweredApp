// Where the verify screen goes after a correct code (docs/backend/sign-up-sign-in-plan.md, 4.2 and 4.5).
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import VerifyScreen from '../app/(auth)/verify';

jest.setTimeout(60000);

const mockReplace = jest.fn();
const mockRefreshProfile = jest.fn();
const mockHoldSignIn = jest.fn();
const mockVerifyCode = jest.fn();
const mockHasProfile = jest.fn();
const mockCreateProfile = jest.fn();

const completeAnswers = {
  name: 'Sam Lee',
  userType: 'patient',
  sex: 'female',
  yearOfBirth: 1980,
  hasDiagnosis: false,
  conditions: [],
  otherConditions: '',
  phoneNumber: '0491570006',
};
// What a sign-in starts with: every answer still empty (as OnboardingContext's initial data).
const emptyAnswers = {
  name: '',
  userType: null,
  sex: null,
  yearOfBirth: null,
  hasDiagnosis: null,
  conditions: [],
  otherConditions: '',
  phoneNumber: '0491570006',
};
let mockData: Record<string, unknown> = {};

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-router', () => ({
  router: { replace: (href: unknown) => mockReplace(href) },
  // The header options the screen sets (back arrow hidden once signed in) aren't part of these tests.
  Stack: { Screen: () => null },
}));
jest.mock('@/components/mpowered/KeyboardDoneBar', () => ({ useKeyboardDoneBar: () => ({ id: undefined, bar: null }) }));
jest.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ refreshProfile: mockRefreshProfile, holdSignIn: mockHoldSignIn }),
}));
jest.mock('@/context/Onboarding-Context', () => ({ useOnboarding: () => ({ data: mockData }) }));
jest.mock('@/services/auth', () => ({
  verifyCode: (...args: unknown[]) => mockVerifyCode(...args),
  hasProfile: () => mockHasProfile(),
  sendVerificationCode: jest.fn(),
}));
jest.mock('@/services/profile', () => ({ createProfile: (...args: unknown[]) => mockCreateProfile(...args) }));

const metrics = { frame: { x: 0, y: 0, width: 412, height: 915 }, insets: { top: 24, left: 0, right: 0, bottom: 24 } };

/** Types the code and waits until the last box shows it, so Verify is enabled. */
async function typeCode() {
  fireEvent.changeText(screen.getByLabelText('Verification code'), '123456');
  await waitFor(() => expect(screen.getByText('6')).toBeTruthy());
}

async function enterCode(data: Record<string, unknown>, hasAccount: boolean) {
  mockData = data;
  mockHasProfile.mockResolvedValue({ ok: true, data: hasAccount });
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <VerifyScreen />
    </SafeAreaProvider>,
  );
  await typeCode();
  fireEvent.press(screen.getByText('Verify'));
  await waitFor(() => expect(mockHasProfile).toHaveBeenCalled());
}

beforeEach(() => {
  jest.clearAllMocks();
  mockVerifyCode.mockResolvedValue({ ok: true, data: { userId: 'u1' } });
  mockCreateProfile.mockResolvedValue({ ok: true, data: undefined });
});

describe('VerifyScreen after a correct code', () => {
  it('sign-up, number has an account: holds the app and asks about the existing account', async () => {
    await enterCode({ ...completeAnswers, intent: 'sign-up' }, true);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({ pathname: '/(auth)/account-check', params: { reason: 'account-exists' } }),
    );
    expect(mockHoldSignIn).toHaveBeenCalledWith(true);
    expect(mockHoldSignIn).not.toHaveBeenCalledWith(false);
    expect(mockCreateProfile).not.toHaveBeenCalled();
    // Held before the code is checked, so the account can't open first.
    expect(mockHoldSignIn.mock.invocationCallOrder[0]).toBeLessThan(mockVerifyCode.mock.invocationCallOrder[0]);
  });

  it('sign-up, new number: creates the profile and shows the slides', async () => {
    await enterCode({ ...completeAnswers, intent: 'sign-up' }, false);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/(auth)/verification-confirmation'));
    expect(mockCreateProfile).toHaveBeenCalledTimes(1);
    expect(mockHoldSignIn).toHaveBeenLastCalledWith(false);
  });

  it('sign-up as a support person, new number: skips the patient slides and opens their app', async () => {
    await enterCode({ ...completeAnswers, userType: 'support-person', intent: 'sign-up' }, false);

    await waitFor(() => expect(mockRefreshProfile).toHaveBeenCalled());
    expect(mockCreateProfile).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalledWith('/(auth)/verification-confirmation');
  });

  it('sign-in, number has an account: opens the account', async () => {
    await enterCode({ ...emptyAnswers, intent: 'sign-in' }, true);

    await waitFor(() => expect(mockRefreshProfile).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockHoldSignIn).not.toHaveBeenCalledWith(true);
  });

  it('sign-in, new number: says there is no account', async () => {
    await enterCode({ ...emptyAnswers, intent: 'sign-in' }, false);

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({ pathname: '/(auth)/account-check', params: { reason: 'no-account' } }),
    );
    expect(mockCreateProfile).not.toHaveBeenCalled();
  });

  it('releases the hold when the code is wrong', async () => {
    mockVerifyCode.mockResolvedValue({ ok: false, error: { code: 'INVALID_OTP', message: 'wrong' } });
    mockData = { ...completeAnswers, intent: 'sign-up' };
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <VerifyScreen />
      </SafeAreaProvider>,
    );
    await typeCode();
    fireEvent.press(screen.getByText('Verify'));

    await waitFor(() => expect(mockHoldSignIn).toHaveBeenLastCalledWith(false));
    expect(mockHasProfile).not.toHaveBeenCalled();
  });
});
