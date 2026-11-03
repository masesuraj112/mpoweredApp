import { readReminderTarget, routeForReminder } from './reminderRoute';

describe('readReminderTarget', () => {
  it('reads an appointment target', () => {
    expect(readReminderTarget({ target: { kind: 'appointment', appointmentId: 42 } })).toEqual({
      kind: 'appointment',
      appointmentId: 42,
    });
  });

  it('reads an assessment target', () => {
    expect(readReminderTarget({ target: { kind: 'assessment' } })).toEqual({ kind: 'assessment' });
  });

  it.each([
    ['no data', undefined],
    ['null data', null],
    ['no target', { url: 'https://example.com' }],
    ['an unknown kind', { target: { kind: 'message' } }],
    ['an appointment without an id', { target: { kind: 'appointment' } }],
    ['an appointment id that is text', { target: { kind: 'appointment', appointmentId: '42' } }],
    ['an appointment id that is not whole', { target: { kind: 'appointment', appointmentId: 4.2 } }],
  ])('opens nothing for %s', (_, data) => {
    expect(readReminderTarget(data)).toBeNull();
  });
});

describe('routeForReminder', () => {
  it('opens the appointment’s plan', () => {
    expect(routeForReminder({ kind: 'appointment', appointmentId: 42 })).toEqual({
      pathname: '/planner/review',
      params: { appointmentId: '42' },
    });
  });

  it('opens the Pain Tracker home for an assessment', () => {
    expect(routeForReminder({ kind: 'assessment' })).toEqual({ pathname: '/home' });
  });
});
