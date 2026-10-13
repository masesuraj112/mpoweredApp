// Total social health score and its band.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { SOCIAL_LIFE_OPTIONS, TRAVELLING_OPTIONS } from '@/constants/socialHealthOptions';

export type SocialHealthBand = 'none' | 'slight' | 'moderate' | 'significant';

export type SocialHealthScoreInput = {
  socialLife: string;
  travelling: string;
  mood: number;
  relationWithOthers: number;
  enjoymentOfLife: number;
};

export type SocialHealthScore = { total: number; band: SocialHealthBand; phrase: string };

// S8: completes "Your answers indicate that pain ... your ability to enjoy social activities."
const BAND_PHRASES: Record<SocialHealthBand, string> = {
  none: 'does not limit',
  slight: 'slightly limits',
  moderate: 'limits',
  significant: 'significantly limits',
};

/** Points for a statement: its position in the list (0 = no impact, 5 = worst). null if not in the list. */
export function optionPoints(option: string, options: readonly string[]): number | null {
  const index = options.indexOf(option);
  return index >= 0 ? index : null;
}

/** S7: 0-10, 11-20, 21-30, 31-40. */
function bandFor(total: number): SocialHealthBand {
  if (total <= 10) return 'none';
  if (total <= 20) return 'slight';
  if (total <= 30) return 'moderate';
  return 'significant';
}

/**
 * S5: social life points + travelling points + the three sliders, 0 to 40.
 * Returns null when a statement is not in its list (for example an older row after a rewording).
 */
export function scoreSocialHealth(input: SocialHealthScoreInput): SocialHealthScore | null {
  const socialLife = optionPoints(input.socialLife, SOCIAL_LIFE_OPTIONS);
  const travelling = optionPoints(input.travelling, TRAVELLING_OPTIONS);
  if (socialLife === null || travelling === null) return null;

  const total = socialLife + travelling + input.mood + input.relationWithOthers + input.enjoymentOfLife;
  const band = bandFor(total);
  return { total, band, phrase: BAND_PHRASES[band] };
}
