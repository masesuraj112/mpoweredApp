import { fireEvent, render, screen } from '@testing-library/react-native';

import PlannerScreen from '../../app/(tabs)/planner/index';
import { ok } from '../../src/lib/result';
import { listAppointments } from '../../src/services/care-planner';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
  useFocusEffect: () => {},
}));

jest.mock('@/services/care-planner', () => ({
  listAppointments: jest.fn(),
}));

const mockList = listAppointments as jest.MockedFunction<typeof listAppointments>;

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Planner main screen Add appointment', () => {
  it('shows a header button and a prominent button when there are no appointments', async () => {
    mockList.mockResolvedValue(ok([]));
    await render(<PlannerScreen />);

    expect(await screen.findByText('You have not planned any appointments.')).toBeTruthy();
    const buttons = screen.getAllByRole('button', { name: 'Add appointment' });
    expect(buttons).toHaveLength(2);

    for (const button of buttons) {
      await fireEvent.press(button);
    }
    expect(mockPush).toHaveBeenCalledTimes(2);
    expect(mockPush).toHaveBeenNthCalledWith(1, '/planner/appointment-details');
    expect(mockPush).toHaveBeenNthCalledWith(2, '/planner/appointment-details');
  });

  it('shows only the header button when there are appointments', async () => {
    mockList.mockResolvedValue(
      ok([
        {
          appointmentId: 1,
          dateTime: '2026-06-10T09:30:00',
          practitionerName: 'Dr. Maximiliano Prinzi',
          healthService: 'Pain Clinic',
          status: 'saved',
        },
      ]),
    );
    await render(<PlannerScreen />);

    expect(await screen.findByText('Dr. Maximiliano Prinzi')).toBeTruthy();
    const buttons = screen.getAllByRole('button', { name: 'Add appointment' });
    expect(buttons).toHaveLength(1);

    await fireEvent.press(buttons[0]);
    expect(mockPush).toHaveBeenCalledWith('/planner/appointment-details');
  });

  it('keeps Prepare for my appointment on the same screen', async () => {
    mockList.mockResolvedValue(ok([]));
    await render(<PlannerScreen />);
    await screen.findByText('You have not planned any appointments.');

    await fireEvent.press(screen.getByRole('button', { name: 'Prepare for my appointment' }));
    expect(mockPush).toHaveBeenCalledWith('/planner/appointment-details');
  });
});
