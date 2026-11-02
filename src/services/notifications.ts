// Reminders on this phone (expo-notifications local notifications, decision N-A): permission, the
// Android channels, and replacing the scheduled reminders with a new plan from
// `features/notifications/schedule`. Returns a Result and never throws to the UI. The
// expo-notifications module is the last optional argument so tests can pass a fake one.
// Never logs reminder text: it can say when someone has an appointment.

import * as ExpoNotifications from 'expo-notifications';
import { AndroidImportance, SchedulableTriggerInputTypes } from 'expo-notifications';

import type { Reminder } from '@/features/notifications/schedule';
import { mapError } from '@/lib/errors';
import { fail, ok, run, type Result } from '@/lib/result';

type NotificationsModule = Pick<
  typeof ExpoNotifications,
  | 'getPermissionsAsync'
  | 'requestPermissionsAsync'
  | 'setNotificationChannelAsync'
  | 'scheduleNotificationAsync'
  | 'cancelAllScheduledNotificationsAsync'
  | 'setNotificationHandler'
>;

/** Android channels: people can turn each kind off separately in the phone's settings. */
export const REMINDER_CHANNELS = {
  assessment: { id: 'assessment-reminders', name: 'Assessment reminders' },
  appointment: { id: 'appointment-reminders', name: 'Appointment reminders' },
} as const;

export type ReminderPermission = {
  status: 'granted' | 'denied' | 'undetermined';
  /** False once the phone won't show the prompt again: only the phone's settings can turn it on. */
  canAskAgain: boolean;
};

function toPermission(response: ExpoNotifications.NotificationPermissionsStatus): ReminderPermission {
  return { status: response.granted ? 'granted' : response.status, canAskAgain: response.canAskAgain };
}

/** Whether reminders can be shown, without asking. */
export function getReminderPermission(
  notifications: NotificationsModule = ExpoNotifications,
): Promise<Result<ReminderPermission>> {
  return run(async () => ok(toPermission(await notifications.getPermissionsAsync())));
}

/**
 * Asks to show reminders. The channels are created first: Android 13+ only shows the prompt once a
 * channel exists. Without `canAskAgain` the phone shows nothing and the current answer comes back.
 */
export function requestReminderPermission(
  notifications: NotificationsModule = ExpoNotifications,
): Promise<Result<ReminderPermission>> {
  return run(async () => {
    await createChannels(notifications);
    return ok(toPermission(await notifications.requestPermissionsAsync()));
  });
}

/** Does nothing on iOS, which has no channels (the call returns null there). */
async function createChannels(notifications: NotificationsModule): Promise<void> {
  for (const channel of Object.values(REMINDER_CHANNELS)) {
    await notifications.setNotificationChannelAsync(channel.id, {
      name: channel.name,
      importance: AndroidImportance.DEFAULT,
    });
  }
}

/**
 * Replaces every scheduled reminder with `reminders`. The app schedules nothing else, so it cancels
 * them all first. An empty list just cancels.
 */
export function applyReminders(
  reminders: Reminder[],
  notifications: NotificationsModule = ExpoNotifications,
): Promise<Result<void>> {
  return run(async () => {
    await notifications.cancelAllScheduledNotificationsAsync();
    if (reminders.length === 0) return ok(undefined);
    await createChannels(notifications);
    for (const reminder of reminders) {
      await notifications.scheduleNotificationAsync({
        identifier: reminder.id,
        content: { title: reminder.title, body: reminder.body, data: { target: reminder.target } },
        trigger: {
          type: SchedulableTriggerInputTypes.DATE,
          date: reminder.at,
          channelId: REMINDER_CHANNELS[reminder.target.kind].id,
        },
      });
    }
    return ok(undefined);
  });
}

/** Cancels every scheduled reminder (sign-out, account deletion, both toggles off). */
export function cancelAllReminders(notifications: NotificationsModule = ExpoNotifications): Promise<Result<void>> {
  return run(async () => {
    await notifications.cancelAllScheduledNotificationsAsync();
    return ok(undefined);
  });
}

/**
 * How a reminder shows while the app is open: as a banner and in the list, with sound, and no badge
 * (the app has no unread count). Called once when the app starts. Fails (rather than throwing) where
 * the native module is missing, such as under Jest.
 */
export function showRemindersWhileOpen(notifications: NotificationsModule = ExpoNotifications): Result<void> {
  try {
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
    return ok(undefined);
  } catch (error) {
    return fail(mapError(error));
  }
}
