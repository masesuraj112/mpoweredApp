import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ConsentScreen from '../../app/(tabs)/planner/consent';
import { parseSignature } from '../../src/features/care-planner/signature';
import type { AppointmentPlan } from '../../src/features/care-planner/planTypes';
import { fail, ok } from '../../src/lib/result';
import { getAppointmentPlan, saveRecordingConsent } from '../../src/services/care-planner';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => ({ appointmentId: '1' }),
}));

jest.mock('@/services/care-planner', () => ({
  getAppointmentPlan: jest.fn(),
  saveRecordingConsent: jest.fn(),
}));

const mockGetPlan = getAppointmentPlan as jest.MockedFunction<typeof getAppointmentPlan>;
const mockSave = saveRecordingConsent as jest.MockedFunction<typeof saveRecordingConsent>;

const plan: AppointmentPlan = {
  appointment: {
    appointmentId: 1,
    dateTime: '2026-06-10T09:30:00',
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'General Practitioner (GP)',
    status: 'saved',
  },
  supportPersonName: 'Bron',
  recordingConsentedAt: null,
  questionGroups: [],
};

jest.setTimeout(30000);

beforeEach(() => {
  jest.clearAllMocks();
  mockGetPlan.mockResolvedValue(ok(plan));
});

/** Simulates one finger stroke across the pad using the responder events the pad listens to. */
async function drawStroke(startX = 20) {
  const pad = await screen.findByTestId('signature-pad');
  await fireEvent(pad, 'responderGrant', { nativeEvent: { locationX: startX, locationY: 40 } });
  for (let i = 1; i <= 8; i += 1) {
    await fireEvent(pad, 'responderMove', {
      nativeEvent: { locationX: startX + i * 10, locationY: 40 + i * 3 },
    });
  }
  await fireEvent(pad, 'responderRelease', {
    nativeEvent: { locationX: startX + 90, locationY: 64 },
  });
}

const saveButton = () => screen.getByRole('button', { name: /^Save/ });

describe('ConsentScreen', () => {
  it('shows the details and keeps Save disabled until something is signed', async () => {
    await render(<ConsentScreen />);

    expect(await screen.findByText('Dr. Maximiliano Prinzi')).toBeTruthy();
    expect(screen.getByText('10 June 2026')).toBeTruthy();
    expect(
      screen.getByText('By giving my signature, I agree for patient’s to record today’s consultation'),
    ).toBeTruthy();

    expect(saveButton()).toBeDisabled();
    expect(saveButton().props.accessibilityHint).toMatch(/signature/i);

    await drawStroke();
    expect(saveButton()).toBeEnabled();
  });

  it('does not count a single tap as a signature', async () => {
    await render(<ConsentScreen />);
    const pad = await screen.findByTestId('signature-pad');

    await fireEvent(pad, 'responderGrant', { nativeEvent: { locationX: 30, locationY: 30 } });
    await fireEvent(pad, 'responderRelease', { nativeEvent: { locationX: 30, locationY: 30 } });

    expect(saveButton()).toBeDisabled();
  });

  it('clears the signature and disables Save again', async () => {
    await render(<ConsentScreen />);
    await drawStroke();
    expect(saveButton()).toBeEnabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Clear signature' }));

    expect(saveButton()).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Clear signature' })).toBeDisabled();
  });

  it('saves the appointment id, serialised signature and an ISO timestamp, then goes back', async () => {
    mockSave.mockResolvedValue(ok(undefined));
    await render(<ConsentScreen />);
    await drawStroke();

    await fireEvent.press(saveButton());

    expect(mockSave).toHaveBeenCalledTimes(1);
    const input = mockSave.mock.calls[0][0];
    expect(input.appointmentId).toBe(1);
    expect(input.consentedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    const parsed = parseSignature(input.signature);
    expect(parsed?.paths).toHaveLength(1);
    expect(parsed?.paths[0].startsWith('M')).toBe(true);
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows a saving state while the save is in flight', async () => {
    let finishSave: (value: ReturnType<typeof ok<void>>) => void = () => {};
    mockSave.mockReturnValue(
      new Promise((resolve) => {
        finishSave = resolve;
      }),
    );
    await render(<ConsentScreen />);
    await drawStroke();

    // Not awaited: the save stays pending until we resolve it below.
    void fireEvent.press(saveButton());

    const saving = await screen.findByRole('button', { name: 'Saving' });
    expect(saving).toBeDisabled();
    expect(mockBack).not.toHaveBeenCalled();

    finishSave(ok(undefined));
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it('shows an error and lets the user retry', async () => {
    mockSave.mockResolvedValueOnce(fail({ code: 'NETWORK', message: 'offline' }));
    await render(<ConsentScreen />);
    await drawStroke();

    await fireEvent.press(saveButton());
    expect(await screen.findByText('We could not save the consent.')).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();

    mockSave.mockResolvedValueOnce(ok(undefined));
    await fireEvent.press(screen.getByRole('button', { name: 'Try saving again' }));

    expect(mockSave).toHaveBeenCalledTimes(2);
    expect(mockBack).toHaveBeenCalled();
  });
});
