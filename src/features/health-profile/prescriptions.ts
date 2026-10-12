// Prescription options, validation of the add/edit form, and display text.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AppError } from '@/lib/errors';
import { fail, ok, type Result } from '@/lib/result';

export const STRENGTH_UNITS = ['mg', 'g', '%', 'iu', 'ug'] as const;
export type StrengthUnit = (typeof STRENGTH_UNITS)[number];

// Plural value -> singular label, used when the quantity is exactly 1
export const FORMS = {
  tablets: 'tablet',
  capsules: 'capsule',
  liquids: 'liquid',
  drops: 'drop',
  injections: 'injection',
  sprays: 'spray',
  ml: 'ml',
  patches: 'patch',
} as const;
export type Form = keyof typeof FORMS;

export const UNITS_OF_TIME = {
  hours: 'hour',
  days: 'day',
  weeks: 'week',
  months: 'month',
} as const;
export type UnitOfTime = keyof typeof UNITS_OF_TIME;

export const MAX_NAME_LENGTH = 100;

/** A saved prescription: one row in medications plus its dosage. */
export type Prescription = {
  id: number;
  name: string;
  strength: number;
  strengthUnit: StrengthUnit;
  form: Form;
  amount: number;
  repeatsEvery: number;
  unitOfTime: UnitOfTime;
};

export type PrescriptionInput = Omit<Prescription, 'id'>;

/** What the add/edit screen holds: the text inputs are still strings. */
export type PrescriptionForm = {
  name: string;
  strength: string;
  strengthUnit: StrengthUnit;
  form: Form;
  amount: string;
  repeatsEvery: string;
  unitOfTime: UnitOfTime;
};

function invalid(field: keyof PrescriptionForm, message: string): Result<never> {
  const error: AppError = { code: 'VALIDATION', message, field };
  return fail(error);
}

/** Accepts '5', '0.5' or '2,5'; rejects blanks, zero, negatives and text. */
function parsePositive(value: string): number | null {
  const trimmed = value.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const number = Number(trimmed);
  return number > 0 ? number : null;
}

export function validatePrescription(form: PrescriptionForm): Result<PrescriptionInput> {
  const name = form.name.trim();
  if (!name) return invalid('name', 'Enter the name of your medication.');
  if (name.length > MAX_NAME_LENGTH) {
    return invalid('name', `The medication name must be ${MAX_NAME_LENGTH} characters or fewer.`);
  }

  const strength = parsePositive(form.strength);
  if (strength === null) return invalid('strength', 'Enter a strength greater than 0, for example 5 or 0.5.');

  const amount = parsePositive(form.amount);
  if (amount === null) return invalid('amount', 'Enter how many you take each time, for example 1.');

  const repeatsEvery = parsePositive(form.repeatsEvery);
  if (repeatsEvery === null || !Number.isInteger(repeatsEvery)) {
    return invalid('repeatsEvery', 'Enter how often you take it as a whole number, for example 1.');
  }

  if (!STRENGTH_UNITS.includes(form.strengthUnit)) return invalid('strengthUnit', 'Choose a strength unit.');
  if (!(form.form in FORMS)) return invalid('form', 'Choose a form.');
  if (!(form.unitOfTime in UNITS_OF_TIME)) return invalid('unitOfTime', 'Choose a unit of time.');

  return ok({
    name,
    strength,
    strengthUnit: form.strengthUnit,
    form: form.form,
    amount,
    repeatsEvery,
    unitOfTime: form.unitOfTime,
  });
}

/** Prefills the edit screen from a saved prescription. */
export function toPrescriptionForm(prescription: Prescription): PrescriptionForm {
  return {
    name: prescription.name,
    strength: String(prescription.strength),
    strengthUnit: prescription.strengthUnit,
    form: prescription.form,
    amount: String(prescription.amount),
    repeatsEvery: String(prescription.repeatsEvery),
    unitOfTime: prescription.unitOfTime,
  };
}

/** For example 'Perindopril arginine 5 mg' or 'Diclofenac gel 1%'. */
export function formatPrescriptionName(prescription: Prescription): string {
  const separator = prescription.strengthUnit === '%' ? '' : ' ';
  return `${prescription.name} ${prescription.strength}${separator}${prescription.strengthUnit}`;
}

/** For example '1 tablet every day' or '2 capsules every 8 hours'. */
export function formatFrequency(prescription: Prescription): string {
  const form = prescription.amount === 1 ? FORMS[prescription.form] : prescription.form;
  const period =
    prescription.repeatsEvery === 1
      ? UNITS_OF_TIME[prescription.unitOfTime]
      : `${prescription.repeatsEvery} ${prescription.unitOfTime}`;
  return `${prescription.amount} ${form} every ${period}`;
}

/** Turns a save or delete failure into text the user can act on. */
export function prescriptionErrorMessage(error: AppError): string {
  switch (error.code) {
    case 'VALIDATION':
      // The app's own validation messages are written for the user; raw database ones are not.
      return error.field ? error.message : 'Some of the details are not valid. Please check them.';
    case 'NOT_FOUND':
      return 'This prescription no longer exists. It may have been deleted.';
    case 'NO_PROFILE':
      return 'We could not find your profile. Please finish setting up your account.';
    case 'NO_SESSION':
    case 'NOT_ALLOWED':
      return 'Please sign in again and try once more.';
    case 'NETWORK':
      return 'We could not reach the server. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// Still used as the option list by the Management tracker's medication step, which does not
// read saved prescriptions yet.
export interface PrescriptionScript {
  id: string;
  name: string;
  frequency: string;
}

export const SAMPLE_PRESCRIPTION_SCRIPTS: PrescriptionScript[] = [
  { id: 'perindopril', name: 'Perindopril arginine 5 mg', frequency: 'Once daily' },
  { id: 'candesartan', name: 'Candesartan 16 mg', frequency: 'Once daily' },
  { id: 'amlodipine', name: 'Amlodipine 5 mg', frequency: 'Once daily' },
  { id: 'vitamin-d3', name: 'Vitamin D3 1000 IU', frequency: 'Once daily' },
  { id: 'raloxifene', name: 'Raloxifene 60 mg', frequency: 'Once daily' },
];
