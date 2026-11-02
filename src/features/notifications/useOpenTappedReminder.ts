import {
  clearLastNotificationResponse,
  DEFAULT_ACTION_IDENTIFIER,
  useLastNotificationResponse,
} from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { readReminderTarget, routeForReminder } from './reminderRoute';

/**
 * Opens the right screen when a reminder is tapped, including one that started the app. Used inside
 * the patient tabs, so it only runs once the person is signed in and the router is ready. Each tap
 * is handled once: the response is cleared after opening it.
 */
export function useOpenTappedReminder(): void {
  const response = useLastNotificationResponse();

  useEffect(() => {
    if (!response || response.actionIdentifier !== DEFAULT_ACTION_IDENTIFIER) return;
    const target = readReminderTarget(response.notification.request.content.data);
    clearLastNotificationResponse();
    if (!target) return;

    const route = routeForReminder(target);
    // The plan opens on top of the Care Planner list, so Back goes there rather than out of the tab.
    if (target.kind === 'appointment') router.navigate('/planner');
    router.push(route);
  }, [response]);
}
