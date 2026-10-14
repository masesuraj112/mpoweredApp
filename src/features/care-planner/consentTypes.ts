/**
 * What is saved when the recording consent is signed.
 * Maps to the appointment columns `recording_consent_signature` (text) and
 * `recording_consent_at` (timestamptz).
 */
export type RecordingConsentInput = {
  appointmentId: number;
  /** Serialised signature (see `serializeSignature`). */
  signature: string;
  /** UTC instant, `new Date().toISOString()`: the column is timestamptz. */
  consentedAt: string;
};
