// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { Appointment } from './types';

/**
 * `first-time`: the appointment is still a draft, so the review screen offers Save and no
 * answers can be added yet. `saved`: the normal review screen.
 */
export type ReviewMode = 'first-time' | 'saved';

/** The single source of truth is the appointment's status, never a route param. */
export function getReviewMode(appointment: Pick<Appointment, 'status'>): ReviewMode {
  return appointment.status === 'draft' ? 'first-time' : 'saved';
}

/** One-line hint shown in first-time mode, where the answer boxes are not available. */
export const FIRST_TIME_ANSWERS_HINT = 'You can add the doctor’s answers after you save this plan.';
