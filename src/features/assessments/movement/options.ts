// The answer choices for My Movement. The text is what gets saved, and the summary score
// comes from each answer's position in its list, so keep every list in this order
// (least impact first). The screens, the validator and the Summary all read from here.

export const GENERAL_IMPACT_OPTIONS = [
  'I walk more slowly than usual because of my pain',
  'I lie down to rest more often because of my pain',
  'I only stand up for short periods of time because of my pain',
  'I try not to bend or kneel down because of my pain',
  'I find it difficult to get out of a chair because of my pain',
  'I sit down most of the day because of my pain',
];

export const WALKING_OPTIONS = [
  'Pain does not prevent me walking any distance',
  'Pain prevents me from walking more than 2 kilometres',
  'Pain prevents me from walking more than 1 kilometres',
  'Pain prevents me from walking more than 500 metres',
  'I can only walk using a stick or crutches',
  'I am in bed most of the time',
];

export const LIFTING_OPTIONS = [
  'I can lift heavy weights without extra pain',
  'I can lift heavy weights but it gives extra pain',
  'I struggle to lift heavy weights off the floor, but I can lift them from a table',
  'I struggle to lift heavy weights off the floor, but I can lift medium weights on the table',
  'I can lift very light weights',
  'I cannot lift or carry anything at all',
];

export const SITTING_OPTIONS = [
  'I can sit in any chair as long as I like',
  'I can only sit in my favourite chair as long as I like',
  'Pain prevents me sitting more than one hour',
  'Pain prevents me sitting more than 30 minutes',
  'Pain prevents me from sitting more than 10 minutes',
  'Pain prevents me from sitting at all',
];

export const STANDING_OPTIONS = [
  'I can stand as long as I want without increased pain',
  'I can stand as long as I want but increased my pain',
  'Pain prevents me standing more than one hour',
  'Pain prevents me standing more than 30 minutes',
  'Pain prevents me from standing more than 10 minutes',
  'Pain prevents me from standing at all',
];

/** The most hours the Activity question accepts (hours in a day). */
export const MAX_ACTIVE_HOURS = 24;
