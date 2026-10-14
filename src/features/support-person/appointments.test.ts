import { formatAppointmentTime, getInitials, getNextAppointment, splitAppointments } from './appointments';
import type { Appointment } from './types';

const at = (id: string, startsAt: string): Appointment => ({
  id,
  startsAt,
  practitioner: 'Dr. Test',
  healthService: 'General Practitioner',
});

const NOW = new Date(2026, 5, 10, 12, 0); // 10 June 2026, 12:00pm local

describe('splitAppointments', () => {
  const appointments = [
    at('past-old', '2026-05-01T10:30:00'),
    at('future-late', '2026-07-01T10:30:00'),
    at('past-recent', '2026-06-01T10:30:00'),
    at('future-soon', '2026-06-11T10:30:00'),
  ];

  it('puts upcoming appointments soonest first', () => {
    expect(splitAppointments(appointments, NOW).upcoming.map(a => a.id)).toEqual(['future-soon', 'future-late']);
  });

  it('puts past appointments most recent first', () => {
    expect(splitAppointments(appointments, NOW).past.map(a => a.id)).toEqual(['past-recent', 'past-old']);
  });

  it('treats an appointment starting right now as upcoming', () => {
    const { upcoming } = splitAppointments([at('now', '2026-06-10T12:00:00')], NOW);
    expect(upcoming.map(a => a.id)).toEqual(['now']);
  });

  it('does not reorder the list it was given', () => {
    const copy = [...appointments];
    splitAppointments(appointments, NOW);
    expect(appointments).toEqual(copy);
  });
});

describe('getNextAppointment', () => {
  it('returns the soonest upcoming appointment', () => {
    const next = getNextAppointment([at('b', '2026-07-01T10:30:00'), at('a', '2026-06-11T10:30:00')], NOW);
    expect(next?.id).toBe('a');
  });

  it('returns null when only past appointments exist', () => {
    expect(getNextAppointment([at('old', '2026-01-01T10:30:00')], NOW)).toBeNull();
  });

  it('returns null with no appointments', () => {
    expect(getNextAppointment([], NOW)).toBeNull();
  });
});

describe('formatAppointmentTime', () => {
  it('formats a morning appointment like the designs', () => {
    // The Figma text says "Tuesday, 10 June 2026", but 10 June 2026 is a Wednesday.
    expect(formatAppointmentTime('2026-06-10T10:30:00')).toBe('Wednesday, 10 June 2026 at 10:30am');
  });

  it('shows 12pm for noon and 12am for midnight', () => {
    expect(formatAppointmentTime('2026-06-10T12:05:00')).toMatch(/at 12:05pm$/);
    expect(formatAppointmentTime('2026-06-10T00:05:00')).toMatch(/at 12:05am$/);
  });

  it('uses 12-hour time in the afternoon', () => {
    expect(formatAppointmentTime('2026-06-10T15:00:00')).toMatch(/at 3:00pm$/);
  });
});

describe('getInitials', () => {
  it('uses the first and last name', () => {
    expect(getInitials('Jane Cooper')).toBe('JC');
    expect(getInitials('Mary Anne Smith')).toBe('MS');
  });

  it('uses one letter for a single name', () => {
    expect(getInitials('Cher')).toBe('C');
  });

  it('ignores extra spaces and lowercase', () => {
    expect(getInitials('  steven   harper ')).toBe('SH');
  });

  it('returns an empty string for a blank name', () => {
    expect(getInitials('   ')).toBe('');
  });
});
