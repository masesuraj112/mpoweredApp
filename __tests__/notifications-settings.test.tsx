// Settings > Notifications: turning reminders on asks for permission first, and a refusal leaves
// the toggle off (decision N-E). The hooks are replaced; their own tests cover loading and saving.
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import NotificationsScreen from '../app/(tabs)/settings/notifications';

// The first render of a screen can take long under a full parallel run (as in tracker-routes).
jest.setTimeout(60000);

const mockUpdate = jest.fn();
const mockEnsure = jest.fn();
const mockOpenSettings = jest.fn();
let mockDenied = false;

jest.mock('@/lib/supabase', () => ({ supabase: {} }));
jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useRouter: () => ({ back: jest.fn() }),
  // The page sets its title on the native header, which isn't part of these tests.
  Stack: { Screen: () => null },
}));
jest.mock('@/features/settings/useNotificationSettings', () => ({
  useNotificationSettings: () => ({
    state: { status: 'ready' },
    reload: jest.fn(),
    settings: {
      assessmentReminders: false,
      assessmentEvery: 3,
      assessmentUnit: 'days',
      appointmentReminders: true,
      appointmentDayBefore: true,
      appointmentOnDay: false,
    },
    update: mockUpdate,
    saveError: null,
  }),
}));
jest.mock('@/features/notifications/useReminderPermission', () => ({
  useReminderPermission: () => ({ denied: mockDenied, ensure: mockEnsure, openSettings: mockOpenSettings }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockDenied = false;
});

describe('NotificationsScreen', () => {
  it('asks for permission before turning reminders on, then saves', async () => {
    mockEnsure.mockResolvedValue(true);
    await render(<NotificationsScreen />);

    fireEvent.press(screen.getByLabelText('Assessment reminders'));

    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({ assessmentReminders: true }));
    expect(mockEnsure).toHaveBeenCalledTimes(1);
  });

  it('leaves reminders off when permission is refused', async () => {
    mockEnsure.mockResolvedValue(false);
    await render(<NotificationsScreen />);

    fireEvent.press(screen.getByLabelText('Assessment reminders'));

    await waitFor(() => expect(mockEnsure).toHaveBeenCalled());
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('turns reminders off without asking', async () => {
    await render(<NotificationsScreen />);

    fireEvent.press(screen.getByLabelText('Appointment reminders'));

    expect(mockUpdate).toHaveBeenCalledWith({ appointmentReminders: false });
    expect(mockEnsure).not.toHaveBeenCalled();
  });

  it('explains a refusal and opens the phone’s settings', async () => {
    mockDenied = true;
    await render(<NotificationsScreen />);

    expect(screen.getByText(/turned off for MPowered in your phone’s settings/)).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Open settings' }));
    expect(mockOpenSettings).toHaveBeenCalled();
  });

  it('says nothing about permission when it is allowed', async () => {
    await render(<NotificationsScreen />);

    expect(screen.queryByText(/turned off for MPowered/)).toBeNull();
  });
});
