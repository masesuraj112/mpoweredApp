/**
 * What is sent when the recording consent is signed. The time of consent
 * (`recording_consent_at`, timestamptz) is recorded by the database, not sent by the phone.
 */
export type RecordingConsentInput = {
  appointmentId: number;
  /** Serialised signature (see `serializeSignature`). */
  signature: string;
};
