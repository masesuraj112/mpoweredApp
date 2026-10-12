// Shapes the user's details and assessment entries into the sections of the pain profile.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

import { ScoreThresholds } from '@/constants/scoring-thresholds';
import { formatWeekRange } from '@/features/assessments/week';
import type { PainEntry } from '@/services/assessments';
import type {
  AssessmentSet,
  ManagementEntry,
  MovementEntry,
  PersonalCareEntry,
  SocialHealthEntry,
  UserProfile,
} from '@/services/health';

import { ASSESSMENT_LABELS, ASSESSMENT_TYPES, type AssessmentType } from './assessment-types';

export interface ProfileItem {
  label: string;
  value: string;
}

export interface ProfileSection {
  id: string;
  title: string;
  subtitle?: string;
  /** Compact sections show short, bold answers (e.g. pain scores) */
  variant: 'summary' | 'compact' | 'detail';
  items: ProfileItem[];
  /** False when the assessment behind this section has not been completed yet */
  complete: boolean;
  /** The week the answers come from, for example '18–24 May 2026' */
  period?: string;
  /** Shown instead of the items when the section is not complete */
  incompleteMessage?: string;
}

const NOT_PROVIDED = 'Not provided';
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** For example '24 May 2026'. Takes a 'YYYY-MM-DD' date and never shifts it through UTC. */
export function formatLongDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

/** The age bracket shown on the profile; null when the year of birth is unknown. */
export function ageGroup(yearOfBirth: number | null, currentYear: number): string | null {
  if (yearOfBirth === null) return null;
  const age = currentYear - yearOfBirth;
  if (age < 18) return 'Young Person (under 18 years)';
  if (age < 25) return 'Young Adult (18 to 24 years)';
  if (age < 65) return 'Adult (25 to 64 years)';
  return 'Older Adult (65 years and over)';
}

/** One statement per line, with bullets when there is more than one. */
function statements(values: string[], empty: string): string {
  if (values.length === 0) return empty;
  if (values.length === 1) return values[0];
  return values.map((value) => `• ${value}`).join('\n');
}

function band(scale: Record<number, string>, value: number): string {
  return scale[value] ?? '';
}

/** The date the profile last changed: the newest entry across all five assessments. */
export function lastUpdated(assessments: AssessmentSet): string | null {
  const dates = ASSESSMENT_TYPES.flatMap((type) => {
    const entry = assessments[type];
    return entry ? [entry.date] : [];
  });
  return dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null;
}

export function completedCount(assessments: AssessmentSet): number {
  return ASSESSMENT_TYPES.filter((type) => assessments[type] !== null).length;
}

function aboutSection(user: UserProfile, currentYear: number): ProfileSection {
  return {
    id: 'about',
    title: 'About me',
    variant: 'summary',
    complete: true,
    items: [
      { label: 'Name', value: user.name },
      { label: 'Sex', value: user.sex ?? NOT_PROVIDED },
      { label: 'Age group', value: ageGroup(user.yearOfBirth, currentYear) ?? NOT_PROVIDED },
    ],
  };
}

function conditionsSection(user: UserProfile): ProfileSection {
  return {
    id: 'conditions',
    title: 'My conditions',
    variant: 'summary',
    complete: true,
    items: [
      {
        label: user.conditions.length > 1 ? 'Primary conditions' : 'Primary condition',
        value: user.conditions.length ? user.conditions.join(', ') : 'None recorded',
      },
      { label: 'Other conditions', value: user.otherConditions ?? 'None recorded' },
    ],
  };
}

function painItems(entry: PainEntry): ProfileItem[] {
  const pain = ScoreThresholds.pain as Record<number, string>;
  return [
    { label: 'My Pain location', value: entry.locations.join(', ') },
    { label: `My Current pain: ${entry.current}`, value: band(pain, entry.current) },
    { label: `Average pain: ${entry.average}`, value: band(pain, entry.average) },
    { label: `Worst pain: ${entry.worst}`, value: band(pain, entry.worst) },
    { label: `Mildest pain: ${entry.mildest}`, value: band(pain, entry.mildest) },
    { label: 'Pain characteristics', value: `My pain were: ${entry.characteristics.join(', ')}` },
  ];
}

function movementItems(entry: MovementEntry): ProfileItem[] {
  return [
    {
      label: 'Average activity hour:',
      value: `Last week, I was able to stay active for approximately ${entry.averageActiveHours} hours`,
    },
    { label: 'General Movement:', value: statements(entry.generalImpacts, 'No general impacts recorded.') },
    { label: 'Walking:', value: entry.walking },
    { label: 'Lifting:', value: entry.lifting },
    { label: 'Sitting:', value: entry.sitting },
    { label: 'Standing:', value: entry.standing },
  ];
}

function personalCareItems(entry: PersonalCareEntry): ProfileItem[] {
  return [
    {
      label: 'General Activities:',
      value: statements(entry.generalActivities, 'No general activities recorded.'),
    },
    { label: 'Personal care (washing, dressing, etc)', value: entry.washingDressing },
    { label: 'Sleeping:', value: entry.sleeping },
  ];
}

function socialHealthItems(entry: SocialHealthEntry): ProfileItem[] {
  return [
    { label: 'Social life:', value: entry.socialLife },
    { label: 'Travelling:', value: entry.travelling },
    { label: `Mood: ${entry.mood}`, value: band(ScoreThresholds.mood, entry.mood) },
    {
      label: `Relation with others: ${entry.relationWithOthers}`,
      value: band(ScoreThresholds.relationships, entry.relationWithOthers),
    },
    {
      label: `Enjoyment of life: ${entry.enjoymentOfLife}`,
      value: band(ScoreThresholds.enjoyment, entry.enjoymentOfLife),
    },
    { label: 'Overall mood:', value: entry.moodOverall },
  ];
}

function managementItems(entry: ManagementEntry): ProfileItem[] {
  return [
    { label: 'Medication:', value: statements(entry.medications, 'No medication recorded this week.') },
    { label: 'Exercise:', value: entry.exercise },
    {
      label: 'Emotion:',
      value: entry.emotion ?? 'You did not perform any dedicated strategy to manage your mood.',
    },
  ];
}

const ASSESSMENT_SECTIONS: {
  [T in AssessmentType]: {
    id: string;
    title: string;
    subtitle?: string;
    variant: ProfileSection['variant'];
    items: (entry: NonNullable<AssessmentSet[T]>) => ProfileItem[];
  };
} = {
  pain: {
    id: 'pain',
    title: 'My Pain',
    subtitle: 'Severity of my pain, pattern, and location',
    variant: 'compact',
    items: painItems,
  },
  movement: { id: 'movement', title: 'Impacts to Movement', variant: 'detail', items: movementItems },
  personalCare: {
    id: 'personal-care',
    title: 'Impacts to Personal Care',
    variant: 'detail',
    items: personalCareItems,
  },
  socialHealth: {
    id: 'social-health',
    title: 'Impacts to Social Health',
    variant: 'detail',
    items: socialHealthItems,
  },
  management: {
    id: 'management',
    title: 'My Current Management',
    variant: 'detail',
    items: managementItems,
  },
};

/** The profile section for one assessment; marked incomplete when there is no entry. */
export function assessmentSection<T extends AssessmentType>(
  type: T,
  entry: AssessmentSet[T],
): ProfileSection {
  const config = ASSESSMENT_SECTIONS[type];
  const base = { id: config.id, title: config.title, subtitle: config.subtitle, variant: config.variant };
  if (!entry) {
    return {
      ...base,
      items: [],
      complete: false,
      incompleteMessage: `Not completed yet. Complete the ${ASSESSMENT_LABELS[type]} tracker to add this section.`,
    };
  }
  const items = (config.items as (e: NonNullable<AssessmentSet[T]>) => ProfileItem[])(entry);
  return { ...base, items, complete: true, period: formatWeekRange(entry.weekStart) };
}

/** Every section of the pain profile, in display order. */
export function toProfileSections(
  user: UserProfile,
  assessments: AssessmentSet,
  currentYear: number,
): ProfileSection[] {
  return [
    aboutSection(user, currentYear),
    conditionsSection(user),
    ...ASSESSMENT_TYPES.map((type) => assessmentSection(type, assessments[type])),
  ];
}
