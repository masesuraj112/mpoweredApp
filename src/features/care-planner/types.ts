/**
 * A planned doctor appointment.
 *
 * `dateTime` is local wall-clock time as `YYYY-MM-DDTHH:mm:ss` with no zone suffix (the database
 * column is `timestamp without time zone`). Never convert it to UTC or use `toISOString()`.
 */
export type Appointment = {
  appointmentId: number;
  dateTime: string;
  practitionerName: string | null;
  healthService: string | null;
};
