import type { Appointment } from '@/features/care-planner/types';

import { nextSavedAppointment, testReminder } from './testReminders';

const NOW = new Date(2026, 10, 2, 12, 0);
const appointment = (appointmentId: number, dateTime: string, status: Appointment['status'] = 'saved'): Appointment => ({
  appointmentId,
  dateTime,
  practitionerName: 'Dr Smith',
  healthService: 'Physiotherapy',
  status,
});

describe('nextSavedAppointment', () => {
  it('is the soonest saved appointment after now', () => {
    const next = nextSavedAppointment(
      [
        appointment(1, '2026-11-09T10:00:00'),
        appointment(2, '2026-11-01T10:00:00'),
        appointment(3, '2026-11-04T09:00:00', 'draft'),
        appointment(4, '2026-11-05T14:15:00'),
      ],
      NOW,
    );

    expect(next?.appointmentId).toBe(4);
  });

  it('is null with none ahead', () => {
    expect(nextSavedAppointment([appointment(2, '2026-11-01T10:00:00')], NOW)).toBeNull();
  });
});

describe('testReminder', () => {
  it('uses the real wording and the appointment’s time, and opens its plan', () => {
    const next = appointment(4, '2026-11-05T14:15:00');

    expect(testReminder('appointment-day-before', next)).toEqual({
      id: 'test-reminder:appointment-day-before',
      title: 'Appointment tomorrow',
      body: 'Your appointment is tomorrow at 2:15 PM.',
      target: { kind: 'appointment', appointmentId: 4 },
    });
    expect(testReminder('appointment-on-the-day', next)).toMatchObject({
      title: 'Appointment today',
      body: 'Your appointment is today at 2:15 PM.',
    });
  });

  it('uses 10:30 AM and opens nothing without an appointment', () => {
    expect(testReminder('appointment-on-the-day', null)).toMatchObject({
      body: 'Your appointment is today at 10:30 AM.',
      target: null,
    });
  });

  it('sends the assessment reminder, which opens the Pain Tracker home', () => {
    expect(testReminder('assessment', null)).toEqual({
      id: 'test-reminder:assessment',
      title: 'Time for your health check-in',
      body: 'Take a few minutes to fill in your assessments.',
      target: { kind: 'assessment' },
    });
  });

  it('never names the doctor or the service, and never looks like a planned reminder', () => {
    const next = appointment(4, '2026-11-05T14:15:00');
    for (const kind of ['appointment-day-before', 'appointment-on-the-day', 'assessment'] as const) {
      const reminder = testReminder(kind, next);
      expect(`${reminder.title} ${reminder.body}`).not.toMatch(/Smith|Physiotherapy/);
      expect(reminder.id).toMatch(/^test-reminder:/);
    }
  });
});
