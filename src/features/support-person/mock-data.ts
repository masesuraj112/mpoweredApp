// TODO: replace with Supabase queries once the support person backend exists, e.g.
// supabase.from('support_persons').select('*, patients(*)').eq('users_id', usersId)

import type { Appointment, SupportedPatient, SupportRequest } from './types';

/** Local date-time `days` from today at 10:30am, so upcoming stays upcoming whenever the app runs. */
function daysFromToday(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(10, 30, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T10:30:00`;
}

// Ids start at 101 so they can never be mistaken for the patient Planner's sample appointments (1, 2).
function appointment(appointmentId: number, days: number): Appointment {
  return {
    appointmentId,
    dateTime: daysFromToday(days),
    practitionerName: 'Dr. Maximiliano Prinzi',
    healthService: 'General Practitioner',
    status: 'saved',
  };
}

// Jane has an upcoming appointment and can only add questions (Figma 3911-24852).
// Steven has nothing scheduled and both permissions (Figma 3911-25095).
export const SAMPLE_SUPPORTED_PATIENTS: SupportedPatient[] = [
  {
    id: 'jane-cooper',
    name: 'Jane Cooper',
    condition: 'Chronic Back Pain',
    canAddQuestions: true,
    canAddAnswers: false,
    appointments: [
      appointment(101, 7),
      appointment(102, -14),
      appointment(103, -42),
      appointment(104, -70),
    ],
  },
  {
    id: 'steven-harper',
    name: 'Steven Harper',
    condition: 'Chronic Back Pain',
    canAddQuestions: true,
    canAddAnswers: true,
    appointments: [appointment(111, -21), appointment(112, -49), appointment(113, -77)],
  },
];

export const SAMPLE_SUPPORT_REQUESTS: SupportRequest[] = [
  {
    id: 'request-1',
    patient: {
      id: 'maria-lopez',
      name: 'Maria Lopez',
      condition: 'Osteoarthritis',
      canAddQuestions: true,
      canAddAnswers: true,
      appointments: [appointment(121, 3), appointment(122, -28)],
    },
  },
  {
    id: 'request-2',
    patient: {
      id: 'tom-nguyen',
      name: 'Tom Nguyen',
      condition: 'Chronic Neck Pain',
      canAddQuestions: false,
      canAddAnswers: true,
      appointments: [],
    },
  },
];
