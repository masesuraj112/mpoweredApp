import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ReviewScreen from '../../app/(tabs)/planner/review';
import type { AppointmentPlan } from '../../src/features/care-planner/planTypes';
import { ok } from '../../src/lib/result';
import { getAppointmentPlan, saveAnswers } from '../../src/services/care-planner';

jest.mock('@/lib/supabase', () => ({ supabase: {} }));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({ appointmentId: '1' }),
  useFocusEffect: () => {},
}));

jest.mock('@/services/care-planner', () => ({
  getAppointmentPlan: jest.fn(),
  saveAnswers: jest.fn(),
}));

const mockDictation = {
  status: 'idle' as string,
  issue: null as string | null,
  message: null as string | null,
  canOpenSettings: false,
  start: jest.fn(),
  stop: jest.fn(),
  abort: jest.fn(),
  openSettings: jest.fn(),
};
let mockOnResult: (result: { text: string; isFinal: boolean }) => void = () => {};

jest.mock('@/features/care-planner/voice-recording', () => ({
  useDictation: (options: { onResult: typeof mockOnResult }) => {
    mockOnResult = options.onResult;
    return mockDictation;
  },
}));

const mockGetPlan = getAppointmentPlan as jest.MockedFunction<typeof getAppointmentPlan>;
const mockSave = saveAnswers as jest.MockedFunction<typeof saveAnswers>;

const Q1 = 'What could be causing pain in my lower back?';
const Q2 = 'Are these areas related?';
const Q3 = 'What can I do on bad days?';

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
  questionGroups: [
    {
      groupId: 'a',
      title: 'Pain location',
      questions: [
        { questionId: 1, text: Q1, doctorAnswer: null },
        { questionId: 2, text: Q2, doctorAnswer: 'Likely linked.' },
      ],
    },
    {
      groupId: 'b',
      title: 'Pain intensity',
      questions: [{ questionId: 3, text: Q3, doctorAnswer: null }],
    },
  ],
};

const box = (question: string) => screen.getByLabelText(`Doctor’s answer to: ${question}`);

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

beforeEach(() => {
  jest.clearAllMocks();
  mockDictation.status = 'idle';
  mockDictation.issue = null;
  mockDictation.message = null;
  mockDictation.canOpenSettings = false;
  mockGetPlan.mockResolvedValue(ok(plan));
  mockSave.mockResolvedValue(ok(undefined));
});

describe('AnswerModal opening', () => {
  it('opens on the right question from the pen and from the row', async () => {
    await render(<ReviewScreen />);

    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );
    expect(box(Q1)).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByLabelText(`Doctor’s answer to: ${Q1}`)).toBeNull());

    await fireEvent.press(screen.getByRole('button', { name: `View doctor's answer: ${Q2}` }));
    expect(box(Q2).props.value).toBe('Likely linked.');
  });
});

describe('AnswerModal moving between questions', () => {
  it('keeps drafts, disables the arrows at the ends and stops dictation when moving', async () => {
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );

    expect(screen.getByRole('button', { name: 'Previous question' })).toBeDisabled();
    await fireEvent.changeText(box(Q1), 'first draft');

    await fireEvent.press(screen.getByRole('button', { name: 'Next question' }));
    expect(mockDictation.stop).toHaveBeenCalled();
    expect(box(Q2).props.value).toBe('Likely linked.');
    await fireEvent.changeText(box(Q2), 'second draft');

    await fireEvent.press(screen.getByRole('button', { name: 'Next question' }));
    expect(box(Q3)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Next question' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Previous question' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Previous question' }));
    expect(box(Q1).props.value).toBe('first draft');
  });
});

describe('AnswerModal OK and Cancel', () => {
  it('OK saves every edited answer, closes, and the plan is read again', async () => {
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );
    await fireEvent.changeText(box(Q1), 'first');
    await fireEvent.press(screen.getByRole('button', { name: 'Next question' }));
    await fireEvent.changeText(box(Q2), 'second');

    await fireEvent.press(screen.getByRole('button', { name: 'Save answer' }));

    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(1));
    expect(mockSave).toHaveBeenCalledWith(1, [
      { questionId: 1, answerText: 'first' },
      { questionId: 2, answerText: 'second' },
    ]);
    await waitFor(() => expect(screen.queryByLabelText(`Doctor’s answer to: ${Q2}`)).toBeNull());
    await waitFor(() => expect(mockGetPlan).toHaveBeenCalledTimes(2));
  });

  it('keeps the box open and offers a retry when saving fails', async () => {
    mockSave.mockResolvedValueOnce({ ok: false, error: { code: 'NETWORK', message: 'offline' } });
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );
    await fireEvent.changeText(box(Q1), 'first');

    await fireEvent.press(screen.getByRole('button', { name: 'Save answer' }));
    expect(await screen.findByText('We could not save your answers.')).toBeTruthy();
    expect(box(Q1).props.value).toBe('first');

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(mockSave).toHaveBeenCalledTimes(2));
  });

  it('Cancel with unsaved text asks first, and discarding saves nothing', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );
    await fireEvent.changeText(box(Q1), 'typed');

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));
    expect(alert).toHaveBeenCalledTimes(1);
    expect(box(Q1)).toBeTruthy();

    await act(async () => {
      alert.mock.calls[0][2]?.find((b) => b.text === 'Discard')?.onPress?.();
    });
    await waitFor(() => expect(screen.queryByLabelText(`Doctor’s answer to: ${Q1}`)).toBeNull());
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('Cancel with nothing typed closes without asking', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(alert).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByLabelText(`Doctor’s answer to: ${Q1}`)).toBeNull());
  });
});

describe('AnswerModal dictation', () => {
  it('appends dictated text to the existing answer and keeps it editable', async () => {
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `View doctor's answer: ${Q2}` }),
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Start dictation' }));
    expect(mockDictation.start).toHaveBeenCalledTimes(1);

    await act(async () => {
      mockOnResult({ text: 'and posture', isFinal: false });
    });
    expect(box(Q2).props.value).toBe('Likely linked. and posture');

    await act(async () => {
      mockOnResult({ text: 'and posture', isFinal: true });
    });
    expect(box(Q2).props.value).toBe('Likely linked. and posture');

    await fireEvent.changeText(box(Q2), 'Likely linked. and posture, edited');
    expect(box(Q2).props.value).toBe('Likely linked. and posture, edited');
  });

  it('shows Listening…, the active microphone and a highlighted box while listening', async () => {
    mockDictation.status = 'listening';
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );

    expect(screen.getByText('Listening…')).toBeTruthy();
    const mic = screen.getByRole('button', { name: 'Stop dictation' });
    expect(mic.props.accessibilityState).toEqual(expect.objectContaining({ selected: true }));

    await fireEvent.press(mic);
    expect(mockDictation.stop).toHaveBeenCalled();
  });

  it('explains when dictation is unavailable and typing still works', async () => {
    mockDictation.status = 'unavailable';
    mockDictation.message = 'Dictation isn’t available in this build.';
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );

    expect(screen.getByText('Dictation isn’t available in this build.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start dictation' })).toBeDisabled();

    await fireEvent.changeText(box(Q1), 'typed instead');
    expect(box(Q1).props.value).toBe('typed instead');
  });

  it('offers to open settings when permission is blocked', async () => {
    mockDictation.status = 'error';
    mockDictation.issue = 'permission-blocked';
    mockDictation.canOpenSettings = true;
    mockDictation.message = 'Dictation is turned off for this app.';
    await render(<ReviewScreen />);
    await fireEvent.press(
      await screen.findByRole('button', { name: `Add doctor's answer for: ${Q1}` }),
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));
    expect(mockDictation.openSettings).toHaveBeenCalled();
    expect(box(Q1)).toBeTruthy();
  });
});
