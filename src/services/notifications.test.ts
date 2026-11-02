import * as ExpoNotifications from 'expo-notifications';
import { AndroidImportance, SchedulableTriggerInputTypes } from 'expo-notifications';

import type { Reminder } from '@/features/notifications/schedule';

import {
  applyReminders,
  cancelAllReminders,
  getReminderPermission,
  REMINDER_CHANNELS,
  requestReminderPermission,
  showRemindersWhileOpen,
} from './notifications';

type Fake = jest.Mocked<Parameters<typeof applyReminders>[1] & object>;

/** A fake expo-notifications that records the order of calls. */
function fakeNotifications(permission: Partial<ExpoNotifications.NotificationPermissionsStatus> = {}) {
  const calls: string[] = [];
  const response = { status: 'undetermined', granted: false, canAskAgain: true, expires: 'never', ...permission };
  const fake = {
    getPermissionsAsync: jest.fn(async () => {
      calls.push('get');
      return response;
    }),
    requestPermissionsAsync: jest.fn(async () => {
      calls.push('request');
      return response;
    }),
    setNotificationChannelAsync: jest.fn(async (id: string) => {
      calls.push(`channel:${id}`);
      return null;
    }),
    scheduleNotificationAsync: jest.fn(async (request: { identifier?: string }) => {
      calls.push(`schedule:${request.identifier}`);
      return request.identifier ?? '';
    }),
    cancelAllScheduledNotificationsAsync: jest.fn(async () => {
      calls.push('cancel-all');
    }),
    setNotificationHandler: jest.fn(),
  } as unknown as Fake;
  return { fake, calls };
}

const reminder = (id: string, target: Reminder['target']): Reminder => ({
  id,
  at: new Date(2026, 10, 4, 9, 0),
  title: 'Appointment tomorrow',
  body: 'Your appointment is tomorrow at 10:30 AM.',
  target,
});

describe('getReminderPermission', () => {
  it('reports the permission without asking', async () => {
    const { fake, calls } = fakeNotifications({ status: 'denied' as never, canAskAgain: false });

    const result = await getReminderPermission(fake);

    expect(result).toEqual({ ok: true, data: { status: 'denied', canAskAgain: false } });
    expect(calls).toEqual(['get']);
  });

  it('treats a granted response as granted', async () => {
    const { fake } = fakeNotifications({ status: 'granted' as never, granted: true });

    expect(await getReminderPermission(fake)).toEqual({ ok: true, data: { status: 'granted', canAskAgain: true } });
  });

  it('returns a failure instead of throwing', async () => {
    const { fake } = fakeNotifications();
    fake.getPermissionsAsync.mockRejectedValue(new Error('native module missing'));

    const result = await getReminderPermission(fake);

    expect(result.ok).toBe(false);
  });
});

describe('requestReminderPermission', () => {
  it('creates both channels before asking (Android 13+ shows no prompt without one)', async () => {
    const { fake, calls } = fakeNotifications({ status: 'granted' as never, granted: true });

    const result = await requestReminderPermission(fake);

    expect(result).toEqual({ ok: true, data: { status: 'granted', canAskAgain: true } });
    expect(calls).toEqual(['channel:assessment-reminders', 'channel:appointment-reminders', 'request']);
    expect(fake.setNotificationChannelAsync).toHaveBeenCalledWith('assessment-reminders', {
      name: 'Assessment reminders',
      importance: AndroidImportance.DEFAULT,
    });
  });

  it('passes a refusal back', async () => {
    const { fake } = fakeNotifications({ status: 'denied' as never, canAskAgain: false });

    expect(await requestReminderPermission(fake)).toEqual({ ok: true, data: { status: 'denied', canAskAgain: false } });
  });
});

describe('applyReminders', () => {
  it('cancels everything, then schedules each reminder for its time on its channel', async () => {
    const { fake, calls } = fakeNotifications();
    const appointment = reminder('appointment:42:day-before', { kind: 'appointment', appointmentId: 42 });
    const assessment = reminder('assessment:0', { kind: 'assessment' });

    const result = await applyReminders([appointment, assessment], fake);

    expect(result).toEqual({ ok: true, data: undefined });
    expect(calls[0]).toBe('cancel-all');
    expect(calls.slice(-2)).toEqual(['schedule:appointment:42:day-before', 'schedule:assessment:0']);
    expect(fake.scheduleNotificationAsync).toHaveBeenCalledWith({
      identifier: 'appointment:42:day-before',
      content: {
        title: 'Appointment tomorrow',
        body: 'Your appointment is tomorrow at 10:30 AM.',
        data: { target: { kind: 'appointment', appointmentId: 42 } },
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: appointment.at,
        channelId: REMINDER_CHANNELS.appointment.id,
      },
    });
    expect(fake.scheduleNotificationAsync.mock.calls[1][0].trigger).toMatchObject({
      channelId: REMINDER_CHANNELS.assessment.id,
    });
  });

  it('only cancels when there is nothing to schedule', async () => {
    const { fake, calls } = fakeNotifications();

    await applyReminders([], fake);

    expect(calls).toEqual(['cancel-all']);
  });

  it('returns a failure instead of throwing when scheduling fails', async () => {
    const { fake } = fakeNotifications();
    fake.scheduleNotificationAsync.mockRejectedValue(new Error('too many'));

    const result = await applyReminders([reminder('assessment:0', { kind: 'assessment' })], fake);

    expect(result.ok).toBe(false);
  });
});

describe('cancelAllReminders', () => {
  it('cancels every scheduled reminder', async () => {
    const { fake, calls } = fakeNotifications();

    expect(await cancelAllReminders(fake)).toEqual({ ok: true, data: undefined });
    expect(calls).toEqual(['cancel-all']);
  });

  it('returns a failure instead of throwing', async () => {
    const { fake } = fakeNotifications();
    fake.cancelAllScheduledNotificationsAsync.mockRejectedValue(new Error('native module missing'));

    expect((await cancelAllReminders(fake)).ok).toBe(false);
  });
});

describe('showRemindersWhileOpen', () => {
  it('shows a banner and plays a sound while the app is open, with no badge', async () => {
    const { fake } = fakeNotifications();

    showRemindersWhileOpen(fake);

    const handler = fake.setNotificationHandler.mock.calls[0][0];
    await expect(handler?.handleNotification({} as never)).resolves.toEqual({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    });
  });
});
