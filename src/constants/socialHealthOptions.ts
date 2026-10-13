// The order of each statement list is its score: the first statement scores 0 (no impact) and
// the last scores 5 (worst). Reordering a list changes every score.
// Stored rows hold the statement text itself, so rewording one breaks scoring of older rows
// unless the stored data is migrated too.

export const SOCIAL_LIFE_OPTIONS = [
  'My social life is normal and gives me no extra pain',
  'My social life is normal but increases the degree of pain',
  'Pain has no significant effect on my social life apart from limiting my more energetic interests eg, gym, sports',
  'Pain has restricted my social life and I do not go out as often',
  'Pain has restricted my social life to home',
  'I have no social life because of pain',
] as const;

export const TRAVELLING_OPTIONS = [
  'I can travel anywhere without pain',
  'I can travel anywhere but it gives me extra pain',
  'Pain is bad but I manage journeys over two hours',
  'Pain restricts me to journeys of less than one hour',
  'Pain restricts me to short necessary journeys under 30 minutes',
  'Pain prevents me from traveling except to receive treatment',
] as const;

/** The mood emoji values the screen stores; the save maps each to its "I was feeling ..." sentence. */
export const MOOD_EMOTION_VALUES = ['frustrated', 'sad', 'okay', 'calm', 'delighted'] as const;

export type MoodEmotion = (typeof MOOD_EMOTION_VALUES)[number];

/** Opened by "Explore tips on managing emotions" on the Summary screen. */
export const TIPS_URL = 'https://muscha.org/relaxation/';
