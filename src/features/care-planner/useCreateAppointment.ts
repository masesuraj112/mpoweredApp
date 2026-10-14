import { useCallback, useState } from 'react';

import type { AppError } from '@/lib/errors';
import { createAppointment, updateAppointmentDetails } from '@/services/care-planner';

import { formatLocalTimestamp, type LocalDateTime } from './dateTime';
import type { Appointment, NewAppointmentInput } from './types';

export const MAX_PRACTITIONER_NAME_LENGTH = 100;

export const DATE_TIME_REQUIRED_MESSAGE = 'Choose the date and time of your appointment.';
export const NAME_TOO_LONG_MESSAGE = `Doctor’s name must be ${MAX_PRACTITIONER_NAME_LENGTH} characters or fewer.`;

export type FormErrors = { dateTime?: string; practitionerName?: string };

/** Turns what was typed into what is saved: trimmed, and empty becomes null. */
export function toOptionalText(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/** Checks the form. Returns the messages to show, empty when everything is fine. */
export function validateAppointmentForm(input: {
  dateTime: LocalDateTime | null;
  practitionerName: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (!input.dateTime) errors.dateTime = DATE_TIME_REQUIRED_MESSAGE;
  if (input.practitionerName.trim().length > MAX_PRACTITIONER_NAME_LENGTH) {
    errors.practitionerName = NAME_TOO_LONG_MESSAGE;
  }
  return errors;
}

/**
 * The "Plan my appointment" form: its values, validation and saving.
 *
 * The wizard can go back and forward, so the first save creates the (draft) appointment and every
 * later save updates that same one. It never creates a second record.
 */
export function useCreateAppointment() {
  const [dateTime, setDateTime] = useState<LocalDateTime | null>(null);
  const [practitionerName, setPractitionerName] = useState('');
  const [healthService, setHealthService] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [appointmentId, setAppointmentId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<AppError | null>(null);

  const dirty = dateTime !== null || practitionerName.trim() !== '' || healthService !== null;

  const chooseDateTime = useCallback((next: LocalDateTime) => {
    setDateTime(next);
    setErrors((current) => ({ ...current, dateTime: undefined }));
  }, []);

  const changeName = useCallback((text: string) => {
    setPractitionerName(text);
    setErrors((current) => ({ ...current, practitionerName: undefined }));
  }, []);

  /** Validates and saves. Resolves with the new appointment, or null when it did not save. */
  const submit = useCallback(async (): Promise<Appointment | null> => {
    const found = validateAppointmentForm({ dateTime, practitionerName });
    setErrors(found);
    if (found.dateTime || found.practitionerName || !dateTime) return null;

    const input: NewAppointmentInput = {
      dateTime: formatLocalTimestamp(dateTime),
      practitionerName: toOptionalText(practitionerName),
      healthService,
    };

    setSaving(true);
    setSaveError(null);
    const result =
      appointmentId === null
        ? await createAppointment(input)
        : await updateAppointmentDetails(appointmentId, input);
    setSaving(false);
    if (result.ok) {
      setAppointmentId(result.data.appointmentId);
      return result.data;
    }
    setSaveError(result.error);
    return null;
  }, [appointmentId, dateTime, practitionerName, healthService]);

  return {
    dateTime,
    chooseDateTime,
    practitionerName,
    changeName,
    healthService,
    setHealthService,
    errors,
    appointmentId,
    dirty,
    saving,
    saveError,
    submit,
  };
}
