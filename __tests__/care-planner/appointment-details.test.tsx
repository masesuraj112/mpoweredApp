import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import AppointmentDetailsScreen from '../../app/(tabs)/planner/appointment-details';
import { ok } from '../../src/lib/result';
import { createAppointment, updateAppointmentDetails } from '../../src/services/care-planner';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: jest.fn(), push: mockPush, back: jest.fn() }),
  useNavigation: () => ({ addListener: () => () => {}, dispatch: jest.fn() }),
}));

jest.mock('@/services/care-planner', () => ({
  createAppointment: jest.fn(),
  updateAppointmentDetails: jest.fn(),
}));

const mockCreate = createAppointment as jest.MockedFunction<typeof createAppointment>;
const mockUpdate = updateAppointmentDetails as jest.MockedFunction<typeof updateAppointmentDetails>;

const FIELD = 'Appointment date and time';
const PLACEHOLDER = 'Pick appointment date and time';

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

beforeEach(() => {
  jest.clearAllMocks();
  // Fix only the clock: Wednesday 21 October 2026, 2:30 PM local time.
  jest.useFakeTimers({
    now: new Date(2026, 9, 21, 14, 30, 0),
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'nextTick',
      'queueMicrotask',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'performance',
      'hrtime',
    ],
  });
  mockCreate.mockImplementation(async (input) =>
    ok({ appointmentId: 7, status: 'draft' as const, ...input }),
  );
  mockUpdate.mockImplementation(async (appointmentId, input) =>
    ok({ appointmentId, status: 'draft' as const, ...input }),
  );
});

afterEach(() => {
  jest.useRealTimers();
});

async function pickDay(label: string) {
  await fireEvent.press(screen.getByRole('button', { name: FIELD }));
  await fireEvent.press(await screen.findByRole('button', { name: label }));
}

describe('date and time picker', () => {
  it('commits the chosen date and time on OK and the field shows it', async () => {
    await render(<AppointmentDetailsScreen />);
    expect(screen.getByText(PLACEHOLDER)).toBeTruthy();

    await pickDay('Friday 23 October 2026');
    // Time wheels: 9 AM by default. Move the hour up by one and choose PM.
    await fireEvent(screen.getByLabelText('Hour'), 'accessibilityAction', {
      nativeEvent: { actionName: 'increment' },
    });
    await fireEvent.press(screen.getByText('PM'));
    await fireEvent.press(screen.getByRole('button', { name: 'Confirm date and time' }));

    expect(await screen.findByText('Fri 23 Oct 2026, 10:00 PM')).toBeTruthy();
    expect(screen.queryByText(PLACEHOLDER)).toBeNull();
  });

  it('discards the choice on Cancel', async () => {
    await render(<AppointmentDetailsScreen />);

    await pickDay('Friday 23 October 2026');
    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText(PLACEHOLDER)).toBeTruthy();
  });

  it('marks today and the chosen day, and moves between months', async () => {
    await render(<AppointmentDetailsScreen />);
    await fireEvent.press(screen.getByRole('button', { name: FIELD }));

    expect(await screen.findByRole('button', { name: 'Wednesday 21 October 2026, today' })).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Next month' }));
    expect(await screen.findByRole('button', { name: 'Sunday 1 November 2026' })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Sunday 1 November 2026' }));
    expect(
      screen.getByRole('button', { name: 'Sunday 1 November 2026', selected: true }),
    ).toBeTruthy();
  });
});

describe('saving the appointment', () => {
  it('blocks saving without a date and shows an inline message', async () => {
    await render(<AppointmentDetailsScreen />);

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    expect(await screen.findByText('Choose the date and time of your appointment.')).toBeTruthy();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('saves the local timestamp, stores a blank name as null and goes to the support person', async () => {
    await render(<AppointmentDetailsScreen />);

    await pickDay('Friday 23 October 2026');
    await fireEvent.press(screen.getByRole('button', { name: 'Confirm date and time' }));
    await fireEvent.changeText(
      screen.getByLabelText('Doctor’s name, optional'),
      '    ',
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledWith({
      dateTime: '2026-10-23T09:00:00',
      practitionerName: null,
      healthService: null,
    });
    await waitFor(() =>
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/planner/support-person',
        params: { appointmentId: '7' },
      }),
    );
  });
});

describe('going back and forward through the wizard', () => {
  it('creates the appointment once and updates it when Next is pressed again', async () => {
    await render(<AppointmentDetailsScreen />);

    await pickDay('Friday 23 October 2026');
    await fireEvent.press(screen.getByRole('button', { name: 'Confirm date and time' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(mockCreate).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(1));

    // The person comes back from the support person screen and changes the date.
    await pickDay('Saturday 24 October 2026');
    await fireEvent.press(screen.getByRole('button', { name: 'Confirm date and time' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith(7, {
      dateTime: '2026-10-24T09:00:00',
      practitionerName: null,
      healthService: null,
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledTimes(2));
  });
});
