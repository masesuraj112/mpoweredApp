// Runs in Sydney time, so the daylight saving changes (4 Oct 2026 and 4 Apr 2027) fall inside the
// schedule. Set before any Date is made in this file.
process.env.TZ = 'Australia/Sydney';

/* eslint-disable import/first */
import type { NotificationSettings } from '@/services/settings';

import { planReminders } from './schedule';
/* eslint-enable import/first */

const OFF: NotificationSettings = {
  assessmentReminders: false,
  assessmentEvery: 3,
  assessmentUnit: 'days',
  appointmentReminders: false,
  appointmentDayBefore: false,
  appointmentOnDay: false,
};

describe('planReminders across daylight saving', () => {
  it('runs in a zone with daylight saving', () => {
    expect(new Date(2026, 6, 1).getTimezoneOffset()).not.toBe(new Date(2027, 0, 1).getTimezoneOffset());
  });

  it('keeps assessment reminders at 9:00 when the clocks go back', () => {
    const reminders = planReminders({
      settings: { ...OFF, assessmentReminders: true, assessmentEvery: 1 },
      appointments: [],
      lastAssessmentDate: '2027-04-01',
      now: new Date(2027, 3, 1, 12, 0),
    });

    expect(reminders.map((r) => [r.at.getDate(), r.at.getHours(), r.at.getMinutes()])).toEqual(
      [2, 3, 4, 5, 6, 7, 8, 9].map((day) => [day, 9, 0]),
    );
  });

  it('keeps the day-before reminder at 9:00 when the clocks go forward overnight', () => {
    const [dayBefore, onTheDay] = planReminders({
      settings: {
        ...OFF,
        appointmentReminders: true,
        appointmentDayBefore: true,
        appointmentOnDay: true,
      },
      appointments: [
        { appointmentId: 1, dateTime: '2026-10-05T10:00:00', practitionerName: null, healthService: null, status: 'saved' },
      ],
      lastAssessmentDate: null,
      now: new Date(2026, 9, 1, 12, 0),
    });

    expect([dayBefore.at.getDate(), dayBefore.at.getHours()]).toEqual([4, 9]);
    expect([onTheDay.at.getDate(), onTheDay.at.getHours()]).toEqual([5, 8]);
  });
});
