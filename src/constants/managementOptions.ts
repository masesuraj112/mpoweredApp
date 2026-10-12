// Options for the My Management assessment.
// The exercise ranges use an en dash (–), not a hyphen: stored rows hold the text itself, so
// copy these constants rather than retyping them.

export const EXERCISE_OPTIONS = ['0 days', '1–2 days', '3–4 days', '5–6 days', '7 days'] as const;

/** The last row of the medication list. Saved as no_medication, never as a medication name. */
export const NO_MEDICATION_OPTION = "I didn't take any medication";

/** Opened by "Explore tips on managing pain" on the Summary screen. */
export const MANAGEMENT_TIPS_URL = 'https://muscha.org/pain-guide/';

/** Matches personal_management_medication_names.medication_name varchar(100). */
export const MAX_MEDICATION_NAME_LENGTH = 100;
