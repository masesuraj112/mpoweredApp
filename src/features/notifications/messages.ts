// The words on each reminder. Reminders show on the lock screen, so they never name the doctor, the
// health service, a condition, a question or an answer (decision N-D).
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { formatTime } from '@/features/care-planner/dateTime';

export type ReminderText = { title: string; body: string };

/** "Your appointment is tomorrow at 10:30 AM." */
export function appointmentReminderText(day: 'today' | 'tomorrow', hour: number, minute: number): ReminderText {
  return {
    title: day === 'today' ? 'Appointment today' : 'Appointment tomorrow',
    body: `Your appointment is ${day} at ${formatTime(hour, minute)}.`,
  };
}

export const ASSESSMENT_REMINDER_TEXT: ReminderText = {
  title: 'Time for your health check-in',
  body: 'Take a few minutes to fill in your assessments.',
};
