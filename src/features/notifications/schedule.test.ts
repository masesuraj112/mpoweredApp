import type { Appointment } from '@/features/care-planner/types';
import type { NotificationSettings } from '@/services/settings';

import { ASSESSMENT_REMINDER_COUNT, MAX_REMINDERS, onTheDayTime, planReminders, type Reminder } from './schedule';

// Everything off, as DEFAULT_NOTIFICATION_SETTINGS (not imported: it would load the Supabase client).
const OFF: NotificationSettings = {
  assessmentReminders: false,
  assessmentEvery: 3,
  assessmentUnit: 'days',
  appointmentReminders: false,
  appointmentDayBefore: false,
  appointmentOnDay: false,
};

// Monday 2 November 2026, 12:00 local.
const NOW = new Date(2026, 10, 2, 12, 0);

const appointmentsOn = (overrides: Partial<NotificationSettings> = {}): NotificationSettings => ({
  ...OFF,
  appointmentReminders: true,
  appointmentDayBefore: true,
  appointmentOnDay: true,
  ...overrides,
});

const assessmentsOn = (overrides: Partial<NotificationSettings> = {}): NotificationSettings => ({
  ...OFF,
  assessmentReminders: true,
  ...overrides,
});

const appointment = (appointmentId: number, dateTime: string, status: Appointment['status'] = 'saved'): Appointment => ({
  appointmentId,
  dateTime,
  practitionerName: 'Dr Smith',
  healthService: 'Physiotherapy',
  status,
});

/** "Thu 5 Nov 09:00", from local components, so the checks hold in any time zone. */
const local = (date: Date) => [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes()];

const plan = (settings: NotificationSettings, appointments: Appointment[] = [], lastAssessmentDate: string | null = null) =>
  planReminders({ settings, appointments, lastAssessmentDate, now: NOW });

const ids = (reminders: Reminder[]) => reminders.map((r) => r.id);

describe('planReminders: appointments', () => {
  it('reminds at 9:00 the day before and 2 hours before on the day', () => {
    const reminders = plan(appointmentsOn(), [appointment(42, '2026-11-05T10:30:00')]);

    expect(ids(reminders)).toEqual(['appointment:42:day-before', 'appointment:42:on-the-day']);
    expect(local(reminders[0].at)).toEqual([2026, 11, 4, 9, 0]);
    expect(local(reminders[1].at)).toEqual([2026, 11, 5, 8, 30]);
    expect(reminders[0].target).toEqual({ kind: 'appointment', appointmentId: 42 });
  });

  it('says today or tomorrow and the time, in the app’s 12-hour style', () => {
    const [dayBefore, onTheDay] = plan(appointmentsOn(), [appointment(42, '2026-11-05T14:05:00')]);

    expect(dayBefore.title).toBe('Appointment tomorrow');
    expect(dayBefore.body).toBe('Your appointment is tomorrow at 2:05 PM.');
    expect(onTheDay.title).toBe('Appointment today');
    expect(onTheDay.body).toBe('Your appointment is today at 2:05 PM.');
  });

  it('never names the doctor or the health service', () => {
    const text = plan(appointmentsOn(), [appointment(42, '2026-11-05T10:30:00')])
      .map((r) => `${r.title} ${r.body}`)
      .join(' ');

    expect(text).not.toMatch(/Smith|Physiotherapy/);
  });

  it('only schedules the options that are on', () => {
    const appointments = [appointment(42, '2026-11-05T10:30:00')];

    expect(ids(plan(appointmentsOn({ appointmentOnDay: false }), appointments))).toEqual(['appointment:42:day-before']);
    expect(ids(plan(appointmentsOn({ appointmentDayBefore: false }), appointments))).toEqual(['appointment:42:on-the-day']);
    expect(plan(appointmentsOn({ appointmentReminders: false }), appointments)).toEqual([]);
  });

  it('skips drafts, past appointments and unreadable times', () => {
    const reminders = plan(appointmentsOn(), [
      appointment(1, '2026-11-05T10:30:00', 'draft'),
      appointment(2, '2026-11-01T10:30:00'),
      appointment(3, '2026-11-02T11:59:00'),
      appointment(4, 'not a time'),
    ]);

    expect(reminders).toEqual([]);
  });

  it('skips a day-before reminder whose time has passed but keeps the one on the day', () => {
    // Tomorrow 9:00 is still ahead; today's 9:00 (for an appointment today) is not.
    const reminders = plan(appointmentsOn(), [appointment(7, '2026-11-02T16:00:00')]);

    expect(ids(reminders)).toEqual(['appointment:7:on-the-day']);
    expect(local(reminders[0].at)).toEqual([2026, 11, 2, 14, 0]);
  });

  it('skips an on-the-day reminder whose time has passed', () => {
    expect(plan(appointmentsOn(), [appointment(8, '2026-11-02T13:00:00')])).toEqual([]);
  });

  it('keeps local wall-clock times (no UTC conversion)', () => {
    const [, onTheDay] = plan(appointmentsOn(), [appointment(42, '2026-12-24T23:45:00')]);

    expect(local(onTheDay.at)).toEqual([2026, 12, 24, 21, 45]);
  });
});

describe('onTheDayTime', () => {
  const at = (hour: number, minute: number) => local(onTheDayTime(new Date(2026, 10, 5, hour, minute)));

  it('is 2 hours before', () => {
    expect(at(10, 30)).toEqual([2026, 11, 5, 8, 30]);
    expect(at(15, 0)).toEqual([2026, 11, 5, 13, 0]);
  });

  it('is not before 7:00 am', () => {
    expect(at(8, 0)).toEqual([2026, 11, 5, 7, 0]);
    expect(at(8, 30)).toEqual([2026, 11, 5, 7, 0]);
    expect(at(7, 30)).toEqual([2026, 11, 5, 7, 0]);
  });

  it('is 30 minutes before an appointment before 7:30 am', () => {
    expect(at(7, 15)).toEqual([2026, 11, 5, 6, 45]);
    expect(at(6, 0)).toEqual([2026, 11, 5, 5, 30]);
  });
});

describe('planReminders: assessments', () => {
  it('is due N days after the last assessment at 9:00, then every N days', () => {
    const reminders = plan(assessmentsOn({ assessmentEvery: 3, assessmentUnit: 'days' }), [], '2026-11-01');

    expect(reminders).toHaveLength(ASSESSMENT_REMINDER_COUNT);
    expect(local(reminders[0].at)).toEqual([2026, 11, 4, 9, 0]);
    expect(local(reminders[1].at)).toEqual([2026, 11, 7, 9, 0]);
    expect(reminders[0]).toMatchObject({
      id: 'assessment:0',
      title: 'Time for your health check-in',
      target: { kind: 'assessment' },
    });
  });

  it('counts weeks as 7 days', () => {
    const reminders = plan(assessmentsOn({ assessmentEvery: 2, assessmentUnit: 'weeks' }), [], '2026-11-01');

    expect(local(reminders[0].at)).toEqual([2026, 11, 15, 9, 0]);
    expect(local(reminders[1].at)).toEqual([2026, 11, 29, 9, 0]);
  });

  it('is due at the next 9:00 when overdue', () => {
    // Due 30 Oct; it's now 2 Nov 12:00, so tomorrow 9:00, then every 3 days.
    const reminders = plan(assessmentsOn({ assessmentEvery: 3 }), [], '2026-10-27');

    expect(local(reminders[0].at)).toEqual([2026, 11, 3, 9, 0]);
    expect(local(reminders[1].at)).toEqual([2026, 11, 6, 9, 0]);
  });

  it('is due at the next 9:00 with no assessment yet, so opening the app never pushes it back', () => {
    const morning = planReminders({
      settings: assessmentsOn(),
      appointments: [],
      lastAssessmentDate: null,
      now: new Date(2026, 10, 2, 8, 0),
    });

    expect(local(morning[0].at)).toEqual([2026, 11, 2, 9, 0]);
    expect(local(plan(assessmentsOn(), [], null)[0].at)).toEqual([2026, 11, 3, 9, 0]);
  });

  it('is off when assessment reminders are off', () => {
    expect(plan(assessmentsOn({ assessmentReminders: false }), [], '2026-11-01')).toEqual([]);
  });

  it('treats an unreadable last date like no assessment', () => {
    expect(local(plan(assessmentsOn(), [], '2026-02-31')[0].at)).toEqual([2026, 11, 3, 9, 0]);
  });
});

describe('planReminders: together', () => {
  it('sorts soonest first', () => {
    const reminders = plan(
      { ...appointmentsOn(), assessmentReminders: true, assessmentEvery: 1, assessmentUnit: 'days' },
      [appointment(42, '2026-11-04T10:30:00')],
      '2026-11-02',
    );
    const times = reminders.map((r) => r.at.getTime());

    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(ids(reminders).slice(0, 4)).toEqual([
      'appointment:42:day-before', // 3 Nov 9:00, tied with assessment:0 and ordered by id
      'assessment:0',
      'appointment:42:on-the-day', // 4 Nov 8:30
      'assessment:1', // 4 Nov 9:00
    ]);
  });

  it('keeps at most MAX_REMINDERS, the soonest', () => {
    const many = Array.from({ length: 40 }, (_, i) =>
      appointment(i + 1, `2027-01-${String(i % 28 + 1).padStart(2, '0')}T10:00:00`),
    );
    const reminders = plan({ ...appointmentsOn(), assessmentReminders: true }, many, '2026-11-01');

    expect(reminders).toHaveLength(MAX_REMINDERS);
    // The assessment series is all before January, so none of it is dropped.
    expect(reminders.filter((r) => r.target.kind === 'assessment')).toHaveLength(ASSESSMENT_REMINDER_COUNT);
  });

  it('gives the same ids each time it plans', () => {
    const input = [appointment(42, '2026-11-05T10:30:00')];

    expect(ids(plan(appointmentsOn(), input))).toEqual(ids(plan(appointmentsOn(), input)));
  });
});
