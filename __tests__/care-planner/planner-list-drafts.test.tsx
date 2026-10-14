import { render, screen } from '@testing-library/react-native';

import PlannerScreen from '../../app/(tabs)/planner/index';
import {
  clearMockCreatedAppointments,
  createAppointment,
  markAppointmentSaved,
} from '../../src/services/care-planner';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), back: jest.fn() }),
  useFocusEffect: () => {},
}));

// The first render loads the whole screen's modules, which can exceed the 5s default on a cold run.
jest.setTimeout(30000);

beforeEach(() => {
  clearMockCreatedAppointments();
});

describe('Planner main list and drafts', () => {
  it('never shows a draft, and shows the appointment once it has been saved', async () => {
    const created = await createAppointment({
      dateTime: '2026-11-02T10:00:00',
      practitionerName: 'Dr Draft',
      healthService: null,
    });
    if (!created.ok) throw new Error('could not create the draft');

    const first = await render(<PlannerScreen />);
    // The sample appointments load, the draft does not.
    expect(await screen.findByText('Dr. Maximiliano Prinzi')).toBeTruthy();
    expect(screen.queryByText('Dr Draft')).toBeNull();
    await first.unmount();

    await markAppointmentSaved(created.data.appointmentId);

    await render(<PlannerScreen />);
    expect(await screen.findByText('Dr Draft')).toBeTruthy();
    expect(screen.getByText('Date: 2 November 2026')).toBeTruthy();
  });
});
