import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ReviewScreen from '../../app/(tabs)/planner/review';
import type { AppointmentPlan } from '../../src/features/care-planner/planTypes';
import type { AppointmentStatus } from '../../src/features/care-planner/types';
import { ok } from '../../src/lib/result';
import { getAppointmentPlan, markAppointmentSaved } from '../../src/services/care-planner';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

const mockPush = jest.fn();
const mockDismissTo = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn(), dismissTo: mockDismissTo }),
  useLocalSearchParams: () => ({ appointmentId: '1' }),
  useFocusEffect: () => {},
}));

jest.mock('@/services/care-planner', () => ({
  getAppointmentPlan: jest.fn(),
  markAppointmentSaved: jest.fn(),
  saveAnswers: jest.fn(),
}));

const mockGetPlan = getAppointmentPlan as jest.MockedFunction<typeof getAppointmentPlan>;
const mockMarkSaved = markAppointmentSaved as jest.MockedFunction<typeof markAppointmentSaved>;

const Q1 = 'What could be causing pain in my lower back?';

const planWith = (status: AppointmentStatus): AppointmentPlan => ({
  appointment: {
    appointmentId: 1,
    dateTime: '2026-06-10T09:30:00',
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'General Practitioner (GP)',
    status,
  },
  supportPersonName: 'Bron',
  recordingConsentedAt: null,
  questionGroups: [
    {
      groupId: 'a',
      title: 'Pain location',
      questions: [{ questionId: 1, text: Q1, doctorAnswer: null }],
    },
  ],
});

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

beforeEach(() => {
  jest.clearAllMocks();
  mockMarkSaved.mockResolvedValue(ok(undefined));
});

describe('ReviewScreen first-time mode (draft appointment)', () => {
  beforeEach(() => {
    mockGetPlan.mockResolvedValue(ok(planWith('draft')));
  });

  it('shows an enabled Save instead of Add or Modify Questions, and the hint', async () => {
    await render(<ReviewScreen />);

    const save = await screen.findByRole('button', { name: 'Save' });
    expect(save).toBeEnabled();
    expect(screen.queryByRole('button', { name: 'Add or Modify Questions' })).toBeNull();
    expect(screen.getByText('You can add the doctor’s answers after you save this plan.')).toBeTruthy();
    // Consent is still unticked, and Save is not gated by it.
    expect(screen.getByRole('checkbox', { name: /consent for recording/i, checked: false })).toBeTruthy();
  });

  it('has no pen icons and rows that do not open the answer box', async () => {
    await render(<ReviewScreen />);
    await screen.findByText(Q1);

    expect(screen.queryAllByRole('button', { name: /doctor's answer/i })).toHaveLength(0);

    await fireEvent.press(screen.getByText(Q1));
    expect(screen.queryByLabelText(`Doctor’s answer to: ${Q1}`)).toBeNull();
  });

  it('keeps the consent row working', async () => {
    await render(<ReviewScreen />);

    await fireEvent.press(
      await screen.findByRole('checkbox', { name: /consent for recording/i }),
    );
    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/planner/consent',
      params: { appointmentId: '1' },
    });
  });

  it('Save marks the appointment saved and closes the wizard to the planner', async () => {
    await render(<ReviewScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Save' }));

    await waitFor(() => expect(mockMarkSaved).toHaveBeenCalledWith(1));
    await waitFor(() => expect(mockDismissTo).toHaveBeenCalledWith('/planner'));
  });

  it('stays on the screen with a retry when saving fails', async () => {
    mockMarkSaved.mockResolvedValueOnce({ ok: false, error: { code: 'NETWORK', message: 'offline' } });
    await render(<ReviewScreen />);

    await fireEvent.press(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('We could not save your appointment.')).toBeTruthy();
    expect(mockDismissTo).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByRole('button', { name: 'Try saving again' }));
    await waitFor(() => expect(mockDismissTo).toHaveBeenCalledWith('/planner'));
  });
});

describe('ReviewScreen saved mode (saved appointment)', () => {
  it('keeps Add or Modify Questions, the pens and the answer box', async () => {
    mockGetPlan.mockResolvedValue(ok(planWith('saved')));
    await render(<ReviewScreen />);

    expect(await screen.findByRole('button', { name: 'Add or Modify Questions' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Save' })).toBeNull();
    expect(
      screen.queryByText('You can add the doctor’s answers after you save this plan.'),
    ).toBeNull();

    await fireEvent.press(
      screen.getByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );
    expect(screen.getByLabelText(`Doctor’s answer to: ${Q1}`)).toBeTruthy();
  });
});
