// PLACEHOLDER VALUES. Must be confirmed with the client (Musculoskeletal Health Australia) before
// release. They can be swapped for client-approved values or a list loaded from the database.
//
// The label is stored as the value: the appointment's `health_service` column is text.

export type HealthServiceOption = {
  /** Shown to the person and saved as the appointment's health service. */
  label: string;
};

export const HEALTH_SERVICE_OPTIONS: readonly HealthServiceOption[] = [
  { label: 'General practitioner (GP)' },
  { label: 'Physiotherapist' },
  { label: 'Rheumatologist' },
  { label: 'Occupational therapist' },
  { label: 'Orthopaedic specialist' },
  { label: 'Pain specialist' },
];
