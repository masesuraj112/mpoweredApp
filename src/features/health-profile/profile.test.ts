import type { PainEntry } from '@/services/assessments';
import type { AssessmentSet, UserProfile } from '@/services/health';

import {
  ageGroup,
  assessmentSection,
  completedCount,
  formatLongDate,
  lastUpdated,
  toProfileSections,
} from './profile';

const user: UserProfile = {
  name: 'Jane',
  sex: 'Female',
  yearOfBirth: 1955,
  conditions: ['Osteoarthritis'],
  otherConditions: 'Hypertension',
};

const pain: PainEntry = {
  submissionId: 1,
  date: '2026-05-20',
  weekStart: '2026-05-18',
  current: 0,
  mildest: 0,
  worst: 9,
  average: 7,
  locations: ['Lower Back', 'Knee'],
  characteristics: ['Aching', 'Throbbing'],
};

const empty: AssessmentSet = {
  pain: null,
  movement: null,
  personalCare: null,
  socialHealth: null,
  management: null,
};

describe('ageGroup', () => {
  it.each([
    [2010, 'Young Person (under 18 years)'],
    [2008, 'Young Adult (18 to 24 years)'],
    [1980, 'Adult (25 to 64 years)'],
    [1961, 'Older Adult (65 years and over)'],
  ])('born %i in 2026 is %s', (year, group) => {
    expect(ageGroup(year, 2026)).toBe(group);
  });

  it('is null when the year of birth is unknown', () => {
    expect(ageGroup(null, 2026)).toBeNull();
  });
});

describe('formatLongDate', () => {
  it('formats without shifting the day', () => {
    expect(formatLongDate('2026-05-24')).toBe('24 May 2026');
    expect(formatLongDate('2027-01-01')).toBe('1 January 2027');
  });
});

describe('lastUpdated and completedCount', () => {
  it('are empty when nothing has been recorded', () => {
    expect(lastUpdated(empty)).toBeNull();
    expect(completedCount(empty)).toBe(0);
  });

  it('use the newest date across all assessments', () => {
    const set: AssessmentSet = {
      ...empty,
      pain,
      management: {
        submissionId: 2,
        date: '2026-05-23',
        weekStart: '2026-05-18',
        exercise: 'You exercised for 3-4 days this week.',
        emotion: null,
        medications: [],
      },
    };
    expect(lastUpdated(set)).toBe('2026-05-23');
    expect(completedCount(set)).toBe(2);
  });
});

describe('toProfileSections', () => {
  it('shows user info and conditions, then all five assessment sections in order', () => {
    const sections = toProfileSections(user, { ...empty, pain }, 2026);
    expect(sections.map((s) => s.id)).toEqual([
      'about',
      'conditions',
      'pain',
      'movement',
      'personal-care',
      'social-health',
      'management',
    ]);
    expect(sections[0].items).toContainEqual({ label: 'Age group', value: 'Older Adult (65 years and over)' });
    expect(sections[1].items).toContainEqual({ label: 'Primary condition', value: 'Osteoarthritis' });
  });

  it('marks assessments without data as incomplete', () => {
    const sections = toProfileSections(user, { ...empty, pain }, 2026);
    const byId = Object.fromEntries(sections.map((s) => [s.id, s]));
    expect(byId.pain.complete).toBe(true);
    for (const id of ['movement', 'personal-care', 'social-health', 'management']) {
      expect(byId[id]).toMatchObject({ complete: false, items: [] });
      expect(byId[id].incompleteMessage).toMatch(/Not completed yet/);
    }
  });

  it('fills in a placeholder for missing demographics', () => {
    const [about, conditions] = toProfileSections(
      { name: 'Sam', sex: null, yearOfBirth: null, conditions: [], otherConditions: null },
      empty,
      2026,
    );
    expect(about.items.map((i) => i.value)).toEqual(['Sam', 'Not provided', 'Not provided']);
    expect(conditions.items.map((i) => i.value)).toEqual(['None recorded', 'None recorded']);
  });
});

describe('assessmentSection', () => {
  it('describes pain scores (including 0) and the week they come from', () => {
    const section = assessmentSection('pain', pain);
    expect(section.period).toBe('18–24 May 2026');
    expect(section.items).toContainEqual({ label: 'My Current pain: 0', value: 'I have no pain at all' });
    expect(section.items).toContainEqual({ label: 'My Pain location', value: 'Lower Back, Knee' });
  });

  it('lists several statements on separate lines', () => {
    const section = assessmentSection('personalCare', {
      submissionId: 3,
      date: '2026-05-20',
      weekStart: '2026-05-18',
      generalActivities: ['I get dressed more slowly', 'I sleep less well'],
      washingDressing: 'I need some help',
      sleeping: 'Less than 4 hours',
    });
    expect(section.items[0].value).toBe('• I get dressed more slowly\n• I sleep less well');
  });
});
