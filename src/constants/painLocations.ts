// "Other" is an action row in the UI, never a stored value, so it is kept apart from the presets.
export const OTHER_LOCATION_LABEL = 'Other';

export const PAIN_LOCATION_PRESETS = [
  'Head',
  'Neck',
  'Shoulder',
  'Upper Back',
  'Lower Back',
  'Leg',
  'Hip',
  'Buttock',
  'Knee',
] as const;

/** What the location list shows: the presets followed by the "Other" action row. */
export const PAIN_LOCATION_OPTIONS = [...PAIN_LOCATION_PRESETS, OTHER_LOCATION_LABEL] as const;

/** Longest value the database accepts (varchar(45)). */
export const MAX_PAIN_VALUE_LENGTH = 45;
