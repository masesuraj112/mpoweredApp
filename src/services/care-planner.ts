// Data access for the care planner. Every function returns a Result and never throws to the UI.
// MOCK: serves local sample data. The Supabase version will keep the same signature and take the
// client as its last optional argument.

import type { AppointmentPlan, QuestionGroup } from '@/features/care-planner/planTypes';
import type { Appointment } from '@/features/care-planner/types';
import { mapError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';

/**
 * Sample appointments served by the mock `listAppointments`.
 * Set this to `[]` to see the empty state on the Care Planner screen.
 */
export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    appointmentId: 1,
    dateTime: '2026-06-10T09:30:00',
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'Pain Clinic',
  },
  {
    appointmentId: 2,
    dateTime: '2026-07-26T14:00:00',
    practitionerName: 'Ms Linda Ho',
    healthService: 'Physiotherapy',
  },
];

/** Runs a call and converts thrown errors (for example a lost connection) into a failed Result. */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

/** The signed-in user's appointments. Unsorted: callers use `sortAppointments`. */
export async function listAppointments(): Promise<Result<Appointment[]>> {
  return run(async () => ok([...MOCK_APPOINTMENTS]));
}

/**
 * Placeholder questions shared by every mock plan.
 * Set a group's `questions` to `[]` (for every group) to see the empty state on the review screen.
 */
const MOCK_QUESTION_GROUPS: QuestionGroup[] = [
  {
    groupId: 'pain-location',
    title: 'Pain location',
    questions: [
      {
        questionId: 1,
        text: 'What could be causing pain in my lower back, neck, and knee?',
        doctorAnswer: null,
      },
      {
        questionId: 2,
        text: 'Are these areas related, or are they likely separate issues?',
        doctorAnswer: 'They are likely linked through posture. We will review this at the next visit.',
      },
    ],
  },
  {
    groupId: 'pain-intensity',
    title: 'Pain intensity',
    questions: [
      {
        questionId: 3,
        text: 'My average pain over the past two weeks has been around 7 — what does that indicate?',
        doctorAnswer: null,
      },
      {
        questionId: 4,
        text: 'What can I do to better manage days when the pain is high?',
        doctorAnswer: null,
      },
    ],
  },
];

/** The plan for one appointment: its details, support person and questions. */
export async function getAppointmentPlan(appointmentId: number): Promise<Result<AppointmentPlan>> {
  return run(async () => {
    const appointment = MOCK_APPOINTMENTS.find((a) => a.appointmentId === appointmentId);
    if (!appointment) {
      return fail({ code: 'UNKNOWN', message: 'APPOINTMENT_NOT_FOUND' });
    }
    return ok({
      appointment,
      supportPersonName: 'Bron',
      questionGroups: MOCK_QUESTION_GROUPS.map((group) => ({
        ...group,
        questions: group.questions.map((question) => ({ ...question })),
      })),
    });
  });
}
