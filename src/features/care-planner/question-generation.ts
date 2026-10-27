// Generates the suggested questions for an appointment from the person's latest assessments.
// The app generates them; the database only validates and stores them (decision D1).
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import type { AssessmentSet } from '@/services/health';

/**
 * Questions are only generated once all five assessments have been completed (decision M3).
 * Set to false to generate from whatever has been completed.
 */
export const GENERATION_REQUIRES_ALL_ASSESSMENTS = true;

/** The most questions one appointment can hold (the database accepts up to 60). */
export const MAX_GENERATED_QUESTIONS = 60;
/** The longest a question can be (the database limit). */
export const MAX_QUESTION_LENGTH = 200;

export type GeneratedQuestion = {
  /** Which heading the question sits under, e.g. `pain-location`. */
  groupKey: string;
  question: string;
  /** Identifies the template, stable across wording changes. Not stored. */
  key: string;
  /** Whether the question starts on the appointment plan. Applied by the service after storing. */
  preselected: boolean;
};

type Template = {
  key: string;
  groupKey: string;
  /** The wording; `{locations}`, `{average}`, `{worst}` and `{mildest}` are filled in from the pain entry. */
  text: string;
  /** Ticked when the suggestions first appear (the choice drawn in the design). */
  preselected: boolean;
  /** Left out when the person's answers make the wording meaningless. */
  applies?: (pain: PainFacts) => boolean;
};

type PainFacts = {
  locations: string[];
  current: number;
  mildest: number;
  worst: number;
  average: number;
};

// Wording is from the design. Conditions on when a question applies are PROPOSED — needs MHA
// clinical review (M2), as is the "past two weeks" wording of `average-pain`, because the figure
// comes from the latest weekly entry.
const TEMPLATES: Template[] = [
  {
    key: 'locations-cause',
    groupKey: 'pain-location',
    text: 'What could be causing pain in my {locations}?',
    preselected: true,
    applies: (pain) => pain.locations.length > 0,
  },
  {
    key: 'locations-related',
    groupKey: 'pain-location',
    text: 'Are these areas related, or are they likely separate issues?',
    preselected: true,
    // PROPOSED — needs MHA clinical review (M2): only meaningful with more than one area.
    applies: (pain) => pain.locations.length > 1,
  },
  {
    key: 'average-pain',
    groupKey: 'pain-intensity',
    text: 'My average pain over the past two weeks has been around {average} — what does this indicate?',
    preselected: true,
  },
  {
    key: 'flare-ups',
    groupKey: 'pain-intensity',
    text: 'Even though I don’t have pain right now, I’ve had severe pain at times (up to {worst}). What could explain these flare-ups?',
    preselected: true,
    // PROPOSED — needs MHA clinical review (M2): the wording says there is no pain right now.
    applies: (pain) => pain.current === 0 && pain.worst > 0,
  },
  {
    key: 'pain-varies',
    groupKey: 'pain-intensity',
    text: 'Is it normal for pain to vary between mild ({mildest}) and very severe ({worst})?',
    preselected: false,
    // PROPOSED — needs MHA clinical review (M2): only meaningful when the levels differ.
    applies: (pain) => pain.worst > pain.mildest,
  },
  {
    key: 'high-days',
    groupKey: 'pain-intensity',
    text: 'What can I do to better manage days when the pain is high?',
    preselected: true,
  },
  {
    key: 'mobility-treatments',
    groupKey: 'pain-impact',
    text: 'What treatments or therapies could help improve my mobility?',
    preselected: true,
  },
  {
    key: 'physio-exercise',
    groupKey: 'pain-impact',
    text: 'Would physiotherapy or a specific exercise program be appropriate for me?',
    preselected: false,
  },
  {
    key: 'avoid-movements',
    groupKey: 'pain-impact',
    text: 'Are there movements or activities I should avoid right now?',
    preselected: true,
  },
  {
    key: 'self-care-hard',
    groupKey: 'pain-impact',
    text: 'My pain is making it hard to take care of myself independently — what can we do to improve this?',
    preselected: false,
  },
  {
    key: 'daily-task-supports',
    groupKey: 'pain-impact',
    text: 'Are there strategies, aids, or supports that could help with daily tasks?',
    preselected: false,
  },
  {
    key: 'adjust-treatment',
    groupKey: 'pain-impact',
    text: 'Should we adjust my treatment plan given how much this is affecting my independence?',
    preselected: false,
  },
  {
    key: 'impact-typical',
    groupKey: 'pain-impact',
    text: 'Is this level of impact typical for my condition?',
    preselected: false,
  },
  {
    key: 'quality-of-life',
    groupKey: 'pain-impact',
    text: 'What options are available to improve my quality of life?',
    preselected: false,
  },
  {
    key: 'investigations',
    groupKey: 'management',
    text: 'Are there additional investigations or referrals that might help?',
    preselected: true,
  },
  {
    key: 'prevent-severe',
    groupKey: 'management',
    text: 'How can I prevent the pain from becoming severe again?',
    preselected: false,
  },
  {
    key: 'realistic-goals',
    groupKey: 'management',
    text: 'What are realistic goals for improving my function and independence?',
    preselected: false,
  },
];

/** "lower back, neck, and knee"; "neck and knee"; "neck". */
function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

/**
 * The question text, or null when it cannot be kept within the length limit. A long list of
 * locations is cut short ("..., and other areas") before giving up.
 */
function render(template: Template, pain: PainFacts): string | null {
  const fixed = {
    average: String(pain.average),
    worst: String(pain.worst),
    mildest: String(pain.mildest),
  };
  if (!template.text.includes('{locations}')) {
    const text = fill(template.text, fixed);
    return text.length <= MAX_QUESTION_LENGTH ? text : null;
  }
  for (let count = pain.locations.length; count >= 1; count -= 1) {
    const shown = pain.locations.slice(0, count);
    const list =
      count < pain.locations.length ? `${shown.join(', ')}, and other areas` : joinList(shown);
    const text = fill(template.text, { ...fixed, locations: list });
    if (text.length <= MAX_QUESTION_LENGTH) return text;
  }
  return null;
}

const isComplete = (assessments: AssessmentSet): boolean =>
  Boolean(
    assessments.pain &&
      assessments.movement &&
      assessments.personalCare &&
      assessments.socialHealth &&
      assessments.management,
  );

/**
 * The suggested questions for the person's latest assessments, in display order. Returns an
 * empty list when the generation gate is not met, or when there is no pain entry to base the
 * wording on.
 */
export function generateQuestions(assessments: AssessmentSet): GeneratedQuestion[] {
  if (GENERATION_REQUIRES_ALL_ASSESSMENTS && !isComplete(assessments)) return [];
  const entry = assessments.pain;
  if (!entry) return [];

  const pain: PainFacts = {
    locations: entry.locations,
    current: entry.current,
    mildest: entry.mildest,
    worst: entry.worst,
    average: entry.average,
  };

  const questions: GeneratedQuestion[] = [];
  for (const template of TEMPLATES) {
    if (template.applies && !template.applies(pain)) continue;
    const question = render(template, pain);
    if (question === null) continue;
    questions.push({
      groupKey: template.groupKey,
      question,
      key: template.key,
      preselected: template.preselected,
    });
  }
  return questions.slice(0, MAX_GENERATED_QUESTIONS);
}
