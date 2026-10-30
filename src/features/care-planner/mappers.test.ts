import {
  mapAppointment,
  mapAppointmentPlan,
  mapGeneratedQuestionGroups,
  mapQuestionSuggestions,
  mapSupportPeopleFromLinks,
  mapSupportPerson,
  toLocalTimestamp,
  type QuestionRow,
} from './mappers';

const question = (overrides: Partial<QuestionRow> & Pick<QuestionRow, 'question_id'>): QuestionRow => ({
  group_key: 'pain-location',
  sort_order: 1,
  question: `Q${overrides.question_id}`,
  is_selected: false,
  answer: null,
  ...overrides,
});

const appointmentRow = {
  appointment_id: 7,
  date_time: '2026-11-05T14:30:00',
  practitioner_name: 'Dr Lee',
  health_service: 'GP',
  status: 'saved',
  recording_consent_at: null,
};

describe('mapAppointment and dates', () => {
  it('keeps the local wall-clock string exactly (no Date or UTC conversion)', () => {
    expect(mapAppointment(appointmentRow).dateTime).toBe('2026-11-05T14:30:00');
  });

  it('reshapes other text forms of the same local time without changing the clock', () => {
    expect(toLocalTimestamp('2026-11-05 14:30:00')).toBe('2026-11-05T14:30:00');
    expect(toLocalTimestamp('2026-11-05T14:30:00.250')).toBe('2026-11-05T14:30:00');
    expect(toLocalTimestamp('2026-11-05T14:30')).toBe('2026-11-05T14:30:00');
  });

  it('maps the fields and treats an unknown status as a draft', () => {
    expect(mapAppointment(appointmentRow)).toEqual({
      appointmentId: 7,
      dateTime: '2026-11-05T14:30:00',
      practitionerName: 'Dr Lee',
      healthService: 'GP',
      status: 'saved',
    });
    expect(mapAppointment({ ...appointmentRow, status: 'odd' }).status).toBe('draft');
  });
});

describe('mapQuestionSuggestions', () => {
  const rows = [
    question({ question_id: 5, group_key: 'management', sort_order: 1, is_selected: true }),
    question({ question_id: 2, group_key: 'pain-location', sort_order: 2, is_selected: true, answer: 'Rest' }),
    question({ question_id: 1, group_key: 'pain-location', sort_order: 1 }),
    question({ question_id: 3, group_key: 'pain-impact', sort_order: 1, is_selected: true, answer: '   ' }),
  ];
  const suggestions = mapQuestionSuggestions(
    { status: 'draft', suggestions_generated_on: '2026-10-27' },
    rows,
  );

  it('orders groups by the constant list and questions by sort_order', () => {
    expect(suggestions.groups.map((g) => g.groupId)).toEqual([
      'pain-location',
      'pain-impact',
      'management',
    ]);
    expect(suggestions.groups[0].title).toBe('Pain location');
    expect(suggestions.groups[0].questions.map((q) => q.questionId)).toEqual([1, 2]);
  });

  it('lists the selected questions and counts only real answers as answered', () => {
    expect(suggestions.selectedQuestionIds).toEqual([2, 3, 5]);
    expect(suggestions.answeredQuestionIds).toEqual([2]);
  });

  it('carries the status and the generated date', () => {
    expect(suggestions.appointmentStatus).toBe('draft');
    expect(suggestions.generatedOn).toBe('2026-10-27');
  });

  it('leaves generatedOn null when nothing was generated', () => {
    const none = mapQuestionSuggestions({ status: 'draft', suggestions_generated_on: null }, []);
    expect(none.generatedOn).toBeNull();
    expect(none.groups).toEqual([]);
    expect(none.selectedQuestionIds).toEqual([]);
  });

  it('puts a group the list does not know after the known ones, with a readable title', () => {
    const result = mapQuestionSuggestions({ status: 'saved', suggestions_generated_on: null }, [
      question({ question_id: 1, group_key: 'sleep-quality' }),
      question({ question_id: 2, group_key: 'management' }),
    ]);
    expect(result.groups.map((g) => [g.groupId, g.title])).toEqual([
      ['management', 'Management'],
      ['sleep-quality', 'Sleep quality'],
    ]);
  });
});

describe('mapAppointmentPlan', () => {
  const rows = [
    question({ question_id: 1, is_selected: true, answer: 'Take rest' }),
    question({ question_id: 2, is_selected: false }),
    question({ question_id: 3, group_key: 'management', is_selected: true }),
  ];

  it('includes only selected questions, with answers, grouped in order', () => {
    const plan = mapAppointmentPlan(appointmentRow, rows, []);
    expect(plan.questionGroups).toEqual([
      {
        groupId: 'pain-location',
        title: 'Pain location',
        questions: [{ questionId: 1, text: 'Q1', doctorAnswer: 'Take rest' }],
      },
      {
        groupId: 'management',
        title: 'Management',
        questions: [{ questionId: 3, text: 'Q3', doctorAnswer: null }],
      },
    ]);
  });

  it('has no groups for an empty plan', () => {
    expect(mapAppointmentPlan(appointmentRow, [], []).questionGroups).toEqual([]);
    expect(
      mapAppointmentPlan(appointmentRow, [question({ question_id: 1 })], []).questionGroups,
    ).toEqual([]);
  });

  it('keeps the date unchanged and passes the consent time through', () => {
    const plan = mapAppointmentPlan(
      { ...appointmentRow, recording_consent_at: '2026-11-01T03:00:00+00:00' },
      [],
      [],
    );
    expect(plan.appointment.dateTime).toBe('2026-11-05T14:30:00');
    expect(plan.recordingConsentedAt).toBe('2026-11-01T03:00:00+00:00');
  });

  it('joins the support people names, or null when there are none', () => {
    const base = { phone_number: null, email: null, access_type: 'none' };
    const people = [
      mapSupportPerson({ ...base, support_person_id: 1, name: 'Bron' }),
      mapSupportPerson({ ...base, support_person_id: 2, name: 'Sam' }),
    ];
    expect(mapAppointmentPlan(appointmentRow, [], people).supportPersonName).toBe('Bron, Sam');
    expect(mapAppointmentPlan(appointmentRow, [], []).supportPersonName).toBeNull();
  });
});

describe('support people', () => {
  const row = {
    support_person_id: 4,
    name: 'Bron',
    phone_number: '+61411111111',
    email: 'b@example.com',
    access_type: 'questions,answers',
  };

  it('maps a row, turning access_type into the two flags', () => {
    expect(mapSupportPerson(row)).toEqual({
      supportPersonId: 4,
      name: 'Bron',
      phone: '+61411111111',
      email: 'b@example.com',
      canAddQuestions: true,
      canAddAnswers: true,
    });
  });

  it.each(['pending', 'accepted', 'declined'] as const)('keeps the invitation status %s', (status) => {
    expect(mapSupportPerson({ ...row, status }).status).toBe(status);
  });

  it('leaves the status out when the row has none or an unknown one', () => {
    expect(mapSupportPerson(row)).not.toHaveProperty('status');
    expect(mapSupportPerson({ ...row, status: 'revoked' })).not.toHaveProperty('status');
  });

  it('maps embedded links in id order and skips a missing person', () => {
    const people = mapSupportPeopleFromLinks([
      { support_persons: { ...row, support_person_id: 9, name: 'Sam' } },
      { support_persons: null },
      { support_persons: row },
    ]);
    expect(people.map((p) => p.name)).toEqual(['Bron', 'Sam']);
  });
});

describe('mapGeneratedQuestionGroups', () => {
  it('groups in display order and numbers the questions by position', () => {
    const groups = mapGeneratedQuestionGroups([
      { groupKey: 'management', question: 'M1' },
      { groupKey: 'pain-location', question: 'L1' },
      { groupKey: 'pain-location', question: 'L2' },
    ]);
    expect(groups.map((g) => [g.groupId, g.title])).toEqual([
      ['pain-location', 'Pain location'],
      ['management', 'Management'],
    ]);
    expect(groups[0].questions).toEqual([
      { questionId: 2, text: 'L1' },
      { questionId: 3, text: 'L2' },
    ]);
  });

  it('gives no groups for no questions', () => {
    expect(mapGeneratedQuestionGroups([])).toEqual([]);
  });
});
