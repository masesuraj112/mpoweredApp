import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SupportPersonScreen from '../../app/(tabs)/planner/support-person';
import {
  clearMockCreatedAppointments,
  createAppointment,
  getSupportPeople,
} from '../../src/services/care-planner';

const mockPush = jest.fn();
let mockParams: { appointmentId?: string } = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useLocalSearchParams: () => mockParams,
  useNavigation: () => ({ addListener: () => () => {}, dispatch: jest.fn() }),
}));

const NAME = 'Support person’s name';
const PHONE = 'Support person’s phone number';
const EMAIL = 'Support person’s e-mail, optional';

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

let appointmentId = 0;

beforeEach(async () => {
  jest.clearAllMocks();
  clearMockCreatedAppointments();
  const created = await createAppointment({
    dateTime: '2026-10-23T09:00:00',
    practitionerName: null,
    healthService: null,
  });
  if (!created.ok) throw new Error('could not create the draft');
  appointmentId = created.data.appointmentId;
  mockParams = { appointmentId: String(appointmentId) };
});

const savedNames = async () => {
  const people = await getSupportPeople(appointmentId);
  return people.ok ? people.data.map((p) => p.name) : [];
};

describe('SupportPersonScreen', () => {
  it('shows the Figma wording and keeps everything optional apart from the name', async () => {
    await render(<SupportPersonScreen />);

    expect(await screen.findByText('Add a Support Person')).toBeTruthy();
    expect(
      screen.getByText(
        'You can nominate someone to help you prepare for your appointment or you can skip below.',
      ),
    ).toBeTruthy();
    expect(screen.getByPlaceholderText('support person name')).toBeTruthy();
    expect(screen.getByPlaceholderText('Phone number')).toBeTruthy();
    expect(screen.getByPlaceholderText('email address')).toBeTruthy();
    expect(screen.getByText('Access type')).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Add questions' })).toBeTruthy();
    expect(screen.getByRole('checkbox', { name: 'Add doctor’s answer' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Skip' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Add another person' })).toBeTruthy();
  });

  it('blocks Save and shows messages for invalid input', async () => {
    await render(<SupportPersonScreen />);
    await screen.findByText('Add a Support Person');

    await fireEvent.changeText(screen.getByLabelText(PHONE), 'abc');
    await fireEvent.changeText(screen.getByLabelText(EMAIL), 'not-an-email');
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Please enter a name.')).toBeTruthy();
    expect(screen.getByText(/Phone numbers can only contain digits/)).toBeTruthy();
    expect(screen.getByText(/exactly one @|valid email address/)).toBeTruthy();
    expect(mockPush).not.toHaveBeenCalled();
    expect(await savedNames()).toEqual([]);
  });

  it('saves a valid person and goes on to the questions', async () => {
    await render(<SupportPersonScreen />);
    await screen.findByText('Add a Support Person');

    await fireEvent.changeText(screen.getByLabelText(NAME), '  Bron  ');
    await fireEvent.changeText(screen.getByLabelText(PHONE), '0400 000 000');
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Add questions' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/planner/questions',
        params: { appointmentId: String(appointmentId) },
      }),
    );
    const people = await getSupportPeople(appointmentId);
    expect(people.ok && people.data).toEqual([
      {
        name: 'Bron',
        phone: '0400000000',
        email: null,
        canAddQuestions: true,
        canAddAnswers: false,
      },
    ]);
  });

  it('shows the saved person when revisited and replaces the list instead of duplicating', async () => {
    const first = await render(<SupportPersonScreen />);
    await screen.findByText('Add a Support Person');
    await fireEvent.changeText(screen.getByLabelText(NAME), 'Bron');
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
    await first.unmount();

    // Back from the questions screen: the same step again.
    await render(<SupportPersonScreen />);
    expect(await screen.findByText('Bron')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText(NAME), 'Sam');
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(2));

    expect(await savedNames()).toEqual(['Bron', 'Sam']);

    // Saving again with nothing new keeps the same two people.
    await fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(3));
    expect(await savedNames()).toEqual(['Bron', 'Sam']);
  });

  it('adds another person to the list and clears the form', async () => {
    await render(<SupportPersonScreen />);
    await screen.findByText('Add a Support Person');

    await fireEvent.changeText(screen.getByLabelText(NAME), 'Bron');
    await fireEvent.press(screen.getByRole('button', { name: 'Add another person' }));

    expect(await screen.findByText('Support people added')).toBeTruthy();
    expect(screen.getByLabelText(NAME).props.value).toBe('');
    expect(screen.getByRole('button', { name: 'Remove Bron' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Remove Bron' }));
    expect(screen.queryByText('Support people added')).toBeNull();
  });

  it('skips without saving a person', async () => {
    await render(<SupportPersonScreen />);
    await screen.findByText('Add a Support Person');

    await fireEvent.press(screen.getByRole('button', { name: 'Skip' }));

    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));
    expect(await savedNames()).toEqual([]);
  });
});
