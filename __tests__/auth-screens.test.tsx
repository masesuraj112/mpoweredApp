// The rebuilt sign-up and sign-in screens: what each one shows and does (the layout itself is checked on a phone).
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ConsentScreen from '../app/(auth)/consent';
import DemographicsScreen from '../app/(auth)/demographics';
import DiagnosisConditionsScreen from '../app/(auth)/diagnosis-conditions';
import HealthConditionsScreen from '../app/(auth)/health-conditions';
import NameScreen from '../app/(auth)/name';
import OnboardingCarousel from '../app/(auth)/onboarding';
import OtherConditionsScreen from '../app/(auth)/other-conditions';
import PhoneScreen from '../app/(auth)/phone';
import SexScreen from '../app/(auth)/sex';
import UserTypeScreen from '../app/(auth)/user-type';
import VerificationConfirmationScreen from '../app/(auth)/verification-confirmation';
import { OnboardingProvider, useOnboarding } from '../src/context/Onboarding-Context';
import { sendVerificationCode } from '@/services/auth';

jest.setTimeout(60000);

const mockPush = jest.fn();
const mockRefreshProfile = jest.fn();
let mockParams: Record<string, string> = {};

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-router', () => ({
  router: { push: (href: unknown) => mockPush(href), replace: jest.fn() },
  useLocalSearchParams: () => mockParams,
  Stack: { Screen: () => null },
}));
jest.mock('@/components/ui/KeyboardDoneBar', () => ({ useKeyboardDoneBar: () => ({ id: undefined, bar: null }) }));
jest.mock('@/context/AuthContext', () => ({ useAuth: () => ({ refreshProfile: mockRefreshProfile }) }));
jest.mock('@/services/auth', () => ({ sendVerificationCode: jest.fn() }));

const metrics = {
  frame: { x: 0, y: 0, width: 360, height: 780 },
  insets: { top: 24, left: 0, right: 0, bottom: 48 },
};

/** Shows the answers the flow has collected, so a test can check what a screen saved. */
function Answers() {
  const { data } = useOnboarding();
  const { name, userType, sex, hasDiagnosis, conditions, otherConditions, intent } = data;
  return <Probe value={JSON.stringify({ name, userType, sex, hasDiagnosis, conditions, otherConditions, intent })} />;
}
function Probe({ value }: { value: string }) {
  return <Text testID="answers">{value}</Text>;
}
const answers = () => JSON.parse(screen.getByTestId('answers').props.children as string);

async function show(node: React.ReactNode) {
  return render(
    <SafeAreaProvider initialMetrics={metrics}>
      <OnboardingProvider>
        {node}
        <Answers />
      </OnboardingProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  mockParams = {};
});

describe('onboarding carousel', () => {
  it('shows the first slide and lets each dot go to its slide, so swiping is not the only way', async () => {
    await show(<OnboardingCarousel />);
    expect(screen.getByRole('header', { name: 'Track your pain and its impacts weekly' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'slide 2 of 3' }));
    expect(screen.getByRole('header', { name: 'Easily share your pain logs to your healthcare professionals' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'slide 3 of 3' }));
    expect(screen.getByRole('header', { name: 'Get tailored questions to assist your medical consultation' })).toBeTruthy();
  });

  it('offers Get started and Sign in as buttons, and remembers which one was chosen', async () => {
    await show(<OnboardingCarousel />);

    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(answers().intent).toBe('sign-in');
    expect(mockPush).toHaveBeenLastCalledWith('/(auth)/phone');

    await fireEvent.press(screen.getByRole('button', { name: 'Get started →' }));
    expect(answers().intent).toBe('sign-up');
    expect(mockPush).toHaveBeenLastCalledWith('/(auth)/user-type');
  });
});

describe('user type', () => {
  it('cannot continue until one is chosen, then goes to the name step', async () => {
    await show(<UserTypeScreen />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('radio', { name: 'I am a Support Person' }));

    expect(screen.getByRole('radio', { name: 'I am a Support Person', checked: true })).toBeTruthy();
    expect(screen.getByRole('radio', { name: 'I am a Patient', checked: false })).toBeTruthy();
    expect(answers().userType).toBe('support-person');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/name');
  });
});

describe('name', () => {
  it('asks again for a name with letters when the box is empty or invalid', async () => {
    await show(<NameScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByLabelText('Your name'), '1234');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('alert')).toBeTruthy();
  });

  it('saves a valid name without extra spaces and goes on', async () => {
    await show(<NameScreen />);

    await fireEvent.changeText(screen.getByLabelText('Your name'), '  Sam Lee ');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(answers().name).toBe('Sam Lee');
    expect(mockPush).toHaveBeenCalledWith('/(auth)/consent');
  });
});

describe('consent', () => {
  it('greets the person and offers the terms and privacy links', async () => {
    await show(<ConsentScreen />);

    expect(screen.getByRole('header', { name: /Hello there/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Terms and Conditions' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/sex');
  });
});

describe('sex', () => {
  it('cannot continue until one is chosen', async () => {
    await show(<SexScreen />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('radio', { name: 'Prefer not to say' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(answers().sex).toBe('prefer not to say');
    expect(mockPush).toHaveBeenCalledWith('/(auth)/demographics');
  });
});

describe('year of birth', () => {
  it('keeps only four digits, never a future year, and the question is optional', async () => {
    await show(<DemographicsScreen />);
    const input = screen.getByLabelText('Year of birth, optional');

    await fireEvent.changeText(input, '19a85x9');
    expect(screen.getByLabelText('Year of birth, optional').props.value).toBe('1985');

    await fireEvent.changeText(input, '9999');
    expect(screen.getByLabelText('Year of birth, optional').props.value).toBe(String(new Date().getFullYear()));

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenCalledWith('/(auth)/health-conditions');
  });
});

describe('health conditions', () => {
  it('cannot continue until answered, and sends a diagnosis to the list and no diagnosis to the free text', async () => {
    await show(<HealthConditionsScreen />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('radio', { name: 'Yes, I have' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenLastCalledWith('/(auth)/diagnosis-conditions');

    await fireEvent.press(screen.getByRole('radio', { name: "No, I haven't" }));
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/(auth)/other-conditions', params: { noDiagnosis: '1' } });
  });
});

describe('diagnosis conditions', () => {
  it('cannot continue without a condition; choosing one shows a chip that can be removed', async () => {
    await show(<DiagnosisConditionsScreen />);
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Gout' }));
    expect(screen.getByRole('button', { name: 'Remove Gout' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
    expect(answers().conditions).toEqual(['Gout']);

    await fireEvent.press(screen.getByRole('button', { name: 'Remove Gout' }));
    expect(screen.queryByRole('button', { name: 'Remove Gout' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('filters the list by what is typed, matching the wording shown', async () => {
    await show(<DiagnosisConditionsScreen />);

    await fireEvent.changeText(screen.getByLabelText('Search diagnoses'), 'paget’s');

    expect(screen.getByRole('checkbox', { name: 'Paget’s disease' })).toBeTruthy();
    expect(screen.queryByRole('checkbox', { name: 'Lupus' })).toBeNull();
  });

  it('adds a diagnosis that is not in the list, once, ignoring case', async () => {
    await show(<DiagnosisConditionsScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Other – add custom diagnosis' }));
    await fireEvent.changeText(screen.getByLabelText('Custom diagnosis'), 'Tennis elbow');
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByRole('button', { name: 'Remove Tennis elbow' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Other – add custom diagnosis' }));
    await fireEvent.changeText(screen.getByLabelText('Custom diagnosis'), 'tennis ELBOW');
    await fireEvent.press(screen.getByRole('button', { name: 'Add' }));
    expect(answers().conditions).toEqual(['Tennis elbow']);
  });

  it('continues to the other conditions step', async () => {
    await show(<DiagnosisConditionsScreen />);
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Lupus' }));

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(mockPush).toHaveBeenCalledWith('/(auth)/other-conditions');
  });
});

describe('other conditions', () => {
  it('asks about other conditions after a diagnosis', async () => {
    await show(<OtherConditionsScreen />);

    expect(screen.getByRole('header', { name: 'Do you have any other conditions?' })).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Other conditions'), '  Migraine ');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(answers().otherConditions).toBe('Migraine');
    expect(mockPush).toHaveBeenCalledWith('/(auth)/login-bridge');
  });

  it('asks what they are experiencing when there is no diagnosis', async () => {
    mockParams = { noDiagnosis: '1' };
    await show(<OtherConditionsScreen />);

    expect(screen.getByRole('header', { name: "Tell us what you're experiencing" })).toBeTruthy();
    expect(screen.getByLabelText('Your symptoms')).toBeTruthy();
  });
});

describe('phone number', () => {
  it('explains the format when the number is wrong, and sends no code', async () => {
    await show(<PhoneScreen />);

    await fireEvent.changeText(screen.getByLabelText('Phone number'), '0312345');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Please enter an Australian phone number in the format 04xx xxx xxx');
    expect(sendVerificationCode).not.toHaveBeenCalled();
  });

  it('spaces the number as it is typed, sends the code and goes to the code screen', async () => {
    (sendVerificationCode as jest.Mock).mockResolvedValue({ ok: true, data: undefined });
    await show(<PhoneScreen />);

    await fireEvent.changeText(screen.getByLabelText('Phone number'), '0491570006');
    expect(screen.getByLabelText('Phone number').props.value).toBe('0491 570 006');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    await waitFor(() => expect(sendVerificationCode).toHaveBeenCalledWith('0491570006'));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/(auth)/verify'));
  });

  it('shows why the code could not be sent and stays on the screen', async () => {
    (sendVerificationCode as jest.Mock).mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    await show(<PhoneScreen />);

    await fireEvent.changeText(screen.getByLabelText('Phone number'), '0491570006');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/We could not reach the server/);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('verification confirmation slides', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('moves through the slides on its own and ends on Continue, which opens the app', async () => {
    await show(<VerificationConfirmationScreen />);
    expect(screen.getByText('Powered')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Continue' })).toBeNull();

    await act(async () => jest.advanceTimersByTime(5000));
    expect(screen.getByText(/short questionnaires about how your pain is impacting you/)).toBeTruthy();

    await act(async () => jest.advanceTimersByTime(6500));
    expect(screen.getByText(/this app suggests questions you can ask your doctor/)).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    expect(mockRefreshProfile).toHaveBeenCalledTimes(1);
  });

  it('lets long messages wrap at any text size, with no fixed height to cut them off', async () => {
    await show(<VerificationConfirmationScreen />);
    await act(async () => jest.advanceTimersByTime(5000));
    await act(async () => jest.advanceTimersByTime(6500));

    const message = screen.getByText(/this app suggests questions you can ask your doctor/);
    const style = Object.assign({}, ...[message.props.style].flat(Infinity).filter(Boolean));
    expect(style.height).toBeUndefined();
    expect(style.maxHeight).toBeUndefined();
  });
});
