import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';

import QuestionsScreen from '../../app/(tabs)/planner/questions';
import { fail } from '../../src/lib/result';
import {
  clearMockAppointmentQuestions,
  getAppointmentPlan,
  getQuestionSuggestions,
} from '../../src/services/care-planner';

const mockBack = jest.fn();
let mockParams: { appointmentId?: string } = { appointmentId: '1' };

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
  useLocalSearchParams: () => mockParams,
  useNavigation: () => ({ addListener: () => () => {}, dispatch: jest.fn() }),
}));

jest.mock('@/services/care-planner', () => {
  const actual = jest.requireActual('@/services/care-planner');
  return { ...actual, getQuestionSuggestions: jest.fn(actual.getQuestionSuggestions) };
});

const mockGetSuggestions = getQuestionSuggestions as jest.MockedFunction<
  typeof getQuestionSuggestions
>;

const ANSWERED = 'Are these areas related, or are they likely separate issues?';
const UNANSWERED = 'What can I do to better manage days when the pain is high?';
const NOT_CHOSEN = 'Is it normal for pain to vary between mild (2) and very severe (9)?';

const row = (text: string, checked?: boolean) =>
  screen.getByRole('checkbox', {
    name: `Add to my appointment plan: ${text}`,
    ...(checked === undefined ? {} : { checked }),
  });

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

beforeEach(() => {
  jest.clearAllMocks();
  clearMockAppointmentQuestions();
  mockParams = { appointmentId: '1' };
});

describe('QuestionsScreen choosing questions', () => {
  it('shows the groups with the chosen questions ticked and Save disabled', async () => {
    await render(<QuestionsScreen />);

    expect(await screen.findByText('Pain location')).toBeTruthy();
    expect(screen.getByText('Generated on 25 May 2026')).toBeTruthy();
    expect(row(UNANSWERED, true)).toBeTruthy();
    expect(row(NOT_CHOSEN, false)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('ticks a question, enables Save, saves it and goes back with the review updated', async () => {
    await render(<QuestionsScreen />);
    await screen.findByText('Pain location');

    await fireEvent.press(row(NOT_CHOSEN));
    expect(row(NOT_CHOSEN, true)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockBack).toHaveBeenCalled());

    const plan = await getAppointmentPlan(1);
    const texts = plan.ok ? plan.data.questionGroups.flatMap((g) => g.questions.map((q) => q.text)) : [];
    expect(texts).toContain(NOT_CHOSEN);
  });

  it('turns Save off again when a change is undone', async () => {
    await render(<QuestionsScreen />);
    await screen.findByText('Pain location');

    await fireEvent.press(row(NOT_CHOSEN));
    await fireEvent.press(row(NOT_CHOSEN));

    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });
});

describe('QuestionsScreen removing an answered question', () => {
  it('asks before unticking a question that has a doctor’s answer', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<QuestionsScreen />);
    await screen.findByText('Pain location');

    await fireEvent.press(row(ANSWERED));

    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert.mock.calls[0][0]).toBe('Remove this question?');
    expect(String(alert.mock.calls[0][1])).toMatch(/answer/i);
    expect(row(ANSWERED, true)).toBeTruthy();

    const buttons = alert.mock.calls[0][2] ?? [];
    await act(async () => {
      buttons.find((b) => b.text === 'Remove')?.onPress?.();
    });
    await waitFor(() => expect(row(ANSWERED, false)).toBeTruthy());
  });

  it('does not ask for a question without an answer', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    await render(<QuestionsScreen />);
    await screen.findByText('Pain location');

    await fireEvent.press(row(UNANSWERED));

    expect(alert).not.toHaveBeenCalled();
    expect(row(UNANSWERED, false)).toBeTruthy();
  });
});

describe('QuestionsScreen states', () => {
  it('says so when no appointment was chosen', async () => {
    mockParams = {};
    await render(<QuestionsScreen />);

    expect(
      await screen.findByText(
        'No appointment has been chosen, so questions cannot be added yet.',
      ),
    ).toBeTruthy();
  });

  it('shows loading first', async () => {
    mockGetSuggestions.mockReturnValueOnce(new Promise(() => {}));
    await render(<QuestionsScreen />);

    expect(screen.getByLabelText('Loading suggested questions')).toBeTruthy();
  });

  it('shows an error with a retry that loads again', async () => {
    mockGetSuggestions.mockResolvedValueOnce(fail({ code: 'NETWORK', message: 'offline' }));
    await render(<QuestionsScreen />);

    expect(await screen.findByText('We could not load the suggested questions.')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Pain location')).toBeTruthy();
  });
});
