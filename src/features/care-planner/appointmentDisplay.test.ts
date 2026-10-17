import {
  FALLBACK_APPOINTMENT_TITLE,
  formatAppointmentDate,
  getAppointmentDateText,
  getAppointmentTitle,
  getAppointmentViewLabel,
  sortAppointments,
} from './appointmentDisplay';
import type { Appointment } from './types';

const make = (overrides: Partial<Appointment> = {}): Appointment => ({
  appointmentId: 1,
  dateTime: '2026-06-10T09:30:00',
  practitionerName: 'Dr. Maximiliano Prinzi',
  healthService: 'Pain Clinic',
  status: 'saved',
  ...overrides,
});

describe('sortAppointments', () => {
  it('orders soonest first', () => {
    const later = make({ appointmentId: 1, dateTime: '2026-07-26T10:00:00' });
    const sooner = make({ appointmentId: 2, dateTime: '2026-06-10T09:30:00' });
    expect(sortAppointments([later, sooner]).map((a) => a.appointmentId)).toEqual([2, 1]);
  });

  it('orders by time of day on the same date', () => {
    const afternoon = make({ appointmentId: 1, dateTime: '2026-06-10T14:00:00' });
    const morning = make({ appointmentId: 2, dateTime: '2026-06-10T08:15:00' });
    expect(sortAppointments([afternoon, morning]).map((a) => a.appointmentId)).toEqual([2, 1]);
  });

  it('orders across a year boundary', () => {
    const next = make({ appointmentId: 1, dateTime: '2027-01-02T09:00:00' });
    const prev = make({ appointmentId: 2, dateTime: '2026-12-31T23:59:59' });
    expect(sortAppointments([next, prev]).map((a) => a.appointmentId)).toEqual([2, 1]);
  });

  it('breaks ties by id and does not change the input', () => {
    const b = make({ appointmentId: 2 });
    const a = make({ appointmentId: 1 });
    const input = [b, a];
    expect(sortAppointments(input).map((x) => x.appointmentId)).toEqual([1, 2]);
    expect(input).toEqual([b, a]);
  });

  it('returns an empty list for no appointments', () => {
    expect(sortAppointments([])).toEqual([]);
  });
});

describe('getAppointmentTitle', () => {
  it('uses the practitioner name when present', () => {
    expect(getAppointmentTitle(make())).toBe('Dr. Maximiliano Prinzi');
  });

  it('falls back to the health service when the practitioner is null', () => {
    expect(getAppointmentTitle(make({ practitionerName: null }))).toBe('Pain Clinic');
  });

  it('treats a blank practitioner as missing', () => {
    expect(getAppointmentTitle(make({ practitionerName: '   ' }))).toBe('Pain Clinic');
  });

  it('uses the generic title when both are missing', () => {
    expect(getAppointmentTitle(make({ practitionerName: null, healthService: null }))).toBe(
      FALLBACK_APPOINTMENT_TITLE,
    );
  });
});

describe('formatAppointmentDate', () => {
  it('formats the local date', () => {
    expect(formatAppointmentDate('2026-06-10T09:30:00')).toBe('10 June 2026');
  });

  it('keeps the calendar day around midnight (no UTC shift)', () => {
    expect(formatAppointmentDate('2026-06-10T23:59:59')).toBe('10 June 2026');
    expect(formatAppointmentDate('2026-06-10T00:00:00')).toBe('10 June 2026');
  });

  it('returns an empty string for malformed or impossible dates', () => {
    expect(formatAppointmentDate('not a date')).toBe('');
    expect(formatAppointmentDate('2026-02-31T09:00:00')).toBe('');
    expect(formatAppointmentDate('')).toBe('');
  });
});

describe('getAppointmentDateText', () => {
  it('prefixes the date', () => {
    expect(getAppointmentDateText(make())).toBe('Date: 10 June 2026');
  });

  it('is empty when the date is malformed', () => {
    expect(getAppointmentDateText(make({ dateTime: 'bad' }))).toBe('');
  });
});

describe('getAppointmentViewLabel', () => {
  it('names the practitioner and date', () => {
    expect(getAppointmentViewLabel(make())).toBe(
      'Appointment with Dr. Maximiliano Prinzi on 10 June 2026, View',
    );
  });

  it('uses the health service when there is no practitioner', () => {
    expect(getAppointmentViewLabel(make({ practitionerName: null }))).toBe(
      'Appointment with Pain Clinic on 10 June 2026, View',
    );
  });

  it('omits the date when it cannot be read', () => {
    expect(getAppointmentViewLabel(make({ dateTime: 'bad' }))).toBe(
      'Appointment with Dr. Maximiliano Prinzi, View',
    );
  });
});
