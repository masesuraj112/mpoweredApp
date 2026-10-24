// Data access for the support person app. Every function returns a Result and never throws to the UI.
// MOCK: serves local sample data kept in memory (lost when the app restarts). The Supabase version
// will keep the same signatures; see docs/support-person-appointments-plan.md for what it needs.

import type { Appointment, SupportedPatient, SupportRequest } from '@/features/support-person/types';
import { mapError, type AppError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';

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
export const MOCK_SUPPORTED_PATIENTS: SupportedPatient[] = [
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

export const MOCK_SUPPORT_REQUESTS: SupportRequest[] = [
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

/** Runs a call and converts thrown errors (for example a lost connection) into a failed Result. */
async function run<T>(call: () => Promise<Result<T>>): Promise<Result<T>> {
  try {
    return await call();
  } catch (error) {
    return fail(mapError(error));
  }
}

const REQUEST_NOT_FOUND: AppError = { code: 'UNKNOWN', message: 'REQUEST_NOT_FOUND' };
const PATIENT_NOT_FOUND: AppError = { code: 'UNKNOWN', message: 'PATIENT_NOT_FOUND' };

let patients: SupportedPatient[] = [...MOCK_SUPPORTED_PATIENTS];
let requests: SupportRequest[] = [...MOCK_SUPPORT_REQUESTS];

/** Test helper: go back to the sample data. */
export function resetMockSupportPerson(): void {
  patients = [...MOCK_SUPPORTED_PATIENTS];
  requests = [...MOCK_SUPPORT_REQUESTS];
}

/**
 * The patients the signed-in user supports, with the access each gave them.
 * MOCK: it will read accepted `support_persons` rows where `users_id` is the signed-in user.
 */
export async function listSupportedPatients(): Promise<Result<SupportedPatient[]>> {
  return run(async () => ok([...patients]));
}

/**
 * Patients asking the signed-in user to be their support person.
 * MOCK: it will read pending `support_persons` rows (needs a pending/accepted state).
 */
export async function listSupportRequests(): Promise<Result<SupportRequest[]>> {
  return run(async () => ok([...requests]));
}

/**
 * Accepts a request and returns the patient now supported.
 * MOCK: it will mark the `support_persons` row as accepted and set `users_id`.
 */
export async function acceptSupportRequest(requestId: string): Promise<Result<SupportedPatient>> {
  return run(async () => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return fail(REQUEST_NOT_FOUND);
    requests = requests.filter(r => r.id !== requestId);
    if (!patients.some(p => p.id === request.patient.id)) patients = [...patients, request.patient];
    return ok(request.patient);
  });
}

/**
 * Turns a request down.
 * MOCK: it will delete the pending `support_persons` row.
 */
export async function rejectSupportRequest(requestId: string): Promise<Result<void>> {
  return run(async () => {
    if (!requests.some(r => r.id === requestId)) return fail(REQUEST_NOT_FOUND);
    requests = requests.filter(r => r.id !== requestId);
    return ok(undefined);
  });
}

/**
 * Stops supporting a patient.
 * MOCK: it will delete the signed-in user's `support_persons` row for this patient.
 */
export async function unpairFromPatient(patientId: string): Promise<Result<void>> {
  return run(async () => {
    if (!patients.some(p => p.id === patientId)) return fail(PATIENT_NOT_FOUND);
    patients = patients.filter(p => p.id !== patientId);
    return ok(undefined);
  });
}
