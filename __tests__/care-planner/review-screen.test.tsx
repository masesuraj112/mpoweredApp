import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ReviewScreen from '../../app/(tabs)/planner/review';
import type { AppointmentPlan } from '../../src/features/care-planner/planTypes';
import { fail, ok } from '../../src/lib/result';
import { getAppointmentPlan } from '../../src/services/care-planner';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
  useLocalSearchParams: () => ({ appointmentId: '1' }),
  useFocusEffect: () => {},
}));

jest.mock('@/services/care-planner', () => ({
  getAppointmentPlan: jest.fn(),
}));

const mockGetPlan = getAppointmentPlan as jest.MockedFunction<typeof getAppointmentPlan>;

const planWithQuestions: AppointmentPlan = {
  appointment: {
    appointmentId: 1,
    dateTime: '2026-06-10T09:30:00',
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'General Practitioner (GP)',
  },
  supportPersonName: 'Bron',
  recordingConsentedAt: null,
  questionGroups: [
    {
      groupId: 'pain-location',
      title: 'Pain location',
      questions: [
        { questionId: 7, text: 'What could be causing pain?', doctorAnswer: null },
        { questionId: 8, text: 'Are these areas related?', doctorAnswer: 'Likely.' },
      ],
    },
  ],
};

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ReviewScreen recording consent and modify questions', () => {
  it('opens the consent screen from the consent row and keeps Modify questions disabled', async () => {
    mockGetPlan.mockResolvedValue(ok(planWithQuestions));
    await render(<ReviewScreen />);

    const modify = await screen.findByRole('button', { name: 'Modify questions' });
    expect(modify).toBeDisabled();
    expect(modify.props.accessibilityHint).toMatch(/consent/i);

    await fireEvent.press(modify);
    expect(mockPush).not.toHaveBeenCalled();

    const consent = screen.getByRole('checkbox', { name: /consent for recording/i });
    expect(screen.getByRole('checkbox', { checked: false })).toBeTruthy();
    await fireEvent.press(consent);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/planner/consent',
      params: { appointmentId: '1' },
    });
  });

  it('ticks the consent and enables Modify questions once consent has been signed', async () => {
    mockGetPlan.mockResolvedValue(
      ok({ ...planWithQuestions, recordingConsentedAt: '2026-10-14T01:02:03.000Z' }),
    );
    await render(<ReviewScreen />);

    expect(
      await screen.findByRole('checkbox', { name: /consent for recording/i, checked: true }),
    ).toBeTruthy();

    const modify = screen.getByRole('button', { name: 'Modify questions' });
    expect(modify).toBeEnabled();
    await fireEvent.press(modify);

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/planner/questions',
      params: { appointmentId: '1' },
    });
  });

  it('sends the pen button to the answer screen with the question id', async () => {
    mockGetPlan.mockResolvedValue(ok(planWithQuestions));
    await render(<ReviewScreen />);

    await fireEvent.press(
      await screen.findByRole('button', {
        name: "Add doctor's answer for: What could be causing pain?",
      }),
    );
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/planner/answer',
      params: { appointmentId: '1', questionId: '7' },
    });
  });
});

describe('ReviewScreen states', () => {
  it('shows loading first', async () => {
    mockGetPlan.mockReturnValue(new Promise(() => {}));
    await render(<ReviewScreen />);
    expect(screen.getByLabelText('Loading appointment plan')).toBeTruthy();
  });

  it('shows an error with a retry that reloads', async () => {
    mockGetPlan.mockResolvedValueOnce(fail({ code: 'NETWORK', message: 'offline' }));
    await render(<ReviewScreen />);

    expect(await screen.findByText('We could not load your appointment plan.')).toBeTruthy();

    mockGetPlan.mockResolvedValueOnce(ok(planWithQuestions));
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Pain location')).toBeTruthy();
    expect(mockGetPlan).toHaveBeenCalledTimes(2);
  });

  it('shows an empty message when there are no questions', async () => {
    mockGetPlan.mockResolvedValue(
      ok({ ...planWithQuestions, questionGroups: [{ groupId: 'g', title: 'Empty', questions: [] }] }),
    );
    await render(<ReviewScreen />);

    await waitFor(() =>
      expect(
        screen.getByText('You have not added any questions for this appointment yet.'),
      ).toBeTruthy(),
    );
    expect(screen.queryByText('Empty')).toBeNull();
  });
});
