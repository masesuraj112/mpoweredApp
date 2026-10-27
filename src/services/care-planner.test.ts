jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it
jest.mock('@/services/health', () => ({ getAssessments: jest.fn() }));

import type { AssessmentSet } from '@/services/health';
import { getAssessments } from '@/services/health';
import {
  createAppointment,
  deleteSupportPerson,
  getAppointmentPlan,
  getQuestionSuggestions,
  getSupportPeople,
  listAppointments,
  listMySupportPersons,
  markAppointmentSaved,
  saveAnswers,
  saveAppointmentQuestions,
  saveRecordingConsent,
  saveSupportPeople,
  saveSupportPerson,
  updateAppointmentDetails,
} from '@/services/care-planner';

const mockGetAssessments = getAssessments as jest.Mock;

const fakeClient = (parts: Record<string, unknown>) => parts as never;
const rpcResult = (data: unknown, error: unknown = null) =>
  jest.fn().mockResolvedValue({ data, error });
const dbError = (message: string, code = 'P0001') => ({ code, message });

/** A fake query builder: filters return the builder; awaiting it or maybeSingle gives the results in turn. */
function table(...results: { data: unknown; error: unknown }[]) {
  const builder: Record<string, unknown> = {};
  let call = 0;
  const next = () => results[Math.min(call++, results.length - 1)];
  for (const method of ['select', 'eq', 'delete']) {
    builder[method] = jest.fn(() => builder);
  }
  builder.maybeSingle = jest.fn(() => Promise.resolve(next()));
  builder.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(next()).then(resolve, reject);
  return builder as Record<'select' | 'eq' | 'delete' | 'maybeSingle', jest.Mock>;
}
const fromTables = (tables: Record<string, ReturnType<typeof table>>) =>
  jest.fn((name: string) => tables[name]);

const NEW_INPUT = {
  dateTime: '2026-11-05T14:30:00',
  practitionerName: 'Dr Lee',
  healthService: 'GP',
};

const personRow = (overrides: Record<string, unknown> = {}) => ({
  support_person_id: 4,
  name: 'Bron',
  phone_number: '+61411111111',
  email: 'b@example.com',
  access_type: 'questions',
  ...overrides,
});

const questionRow = (id: number, overrides: Record<string, unknown> = {}) => ({
  question_id: id,
  group_key: 'pain-location',
  sort_order: id,
  question: `Q${id}`,
  is_selected: false,
  answer: null,
  ...overrides,
});

const sentArgs = (rpc: jest.Mock) => JSON.stringify(rpc.mock.calls);

describe('listAppointments', () => {
  it('calls list_my_appointments and maps the rows, keeping the local time as it is', async () => {
    const rpc = rpcResult([
      {
        appointment_id: 3,
        date_time: '2026-11-05T14:30:00',
        practitioner_name: 'Dr Lee',
        health_service: 'GP',
        status: 'saved',
      },
    ]);
    const result = await listAppointments(fakeClient({ rpc }));
    expect(rpc).toHaveBeenCalledWith('list_my_appointments');
    expect(result).toEqual({
      ok: true,
      data: [
        {
          appointmentId: 3,
          dateTime: '2026-11-05T14:30:00',
          practitionerName: 'Dr Lee',
          healthService: 'GP',
          status: 'saved',
        },
      ],
    });
  });

  it('maps a database error', async () => {
    const result = await listAppointments(fakeClient({ rpc: rpcResult(null, dbError('NO_PROFILE')) }));
    expect(result).toMatchObject({ ok: false, error: { code: 'NO_PROFILE' } });
  });

  it('turns a lost connection into NETWORK', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await listAppointments(fakeClient({ rpc }));
    expect(result).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
  });
});

describe('createAppointment and updateAppointmentDetails', () => {
  it('sends the details and returns the new id, with the local time unchanged', async () => {
    const rpc = rpcResult(7);
    const result = await createAppointment(NEW_INPUT, fakeClient({ rpc }));
    expect(result).toEqual({ ok: true, data: { appointmentId: 7 } });
    expect(rpc).toHaveBeenCalledWith('save_appointment_details', {
      p_date_time: '2026-11-05T14:30:00',
      p_practitioner_name: 'Dr Lee',
      p_health_service: 'GP',
    });
  });

  it('sends blank values for a missing name or service, and no user or patient id', async () => {
    const rpc = rpcResult(7);
    await createAppointment(
      { dateTime: '2026-11-05T14:30:00', practitionerName: null, healthService: null },
      fakeClient({ rpc }),
    );
    expect(rpc.mock.calls[0][1]).toEqual({
      p_date_time: '2026-11-05T14:30:00',
      p_practitioner_name: '',
      p_health_service: '',
    });
    expect(sentArgs(rpc)).not.toMatch(/patient_id|users_id/);
  });

  it('makes no call for a bad date or a name over 100 characters', async () => {
    const rpc = rpcResult(7);
    const client = fakeClient({ rpc });
    expect(await createAppointment({ ...NEW_INPUT, dateTime: '2026-11-05' }, client)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION' },
    });
    expect(
      await createAppointment({ ...NEW_INPUT, dateTime: '2026-11-05T14:30:00.000Z' }, client),
    ).toMatchObject({ ok: false });
    expect(
      await updateAppointmentDetails(7, { ...NEW_INPUT, practitionerName: 'x'.repeat(101) }, client),
    ).toMatchObject({ ok: false, error: { code: 'VALIDATION' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('accepts a name of exactly 100 characters', async () => {
    const rpc = rpcResult(7);
    const result = await createAppointment(
      { ...NEW_INPUT, practitionerName: 'x'.repeat(100) },
      fakeClient({ rpc }),
    );
    expect(result.ok).toBe(true);
  });

  it('update sends the appointment id and returns it', async () => {
    const rpc = rpcResult(7);
    const result = await updateAppointmentDetails(7, NEW_INPUT, fakeClient({ rpc }));
    expect(result).toEqual({ ok: true, data: { appointmentId: 7 } });
    expect(rpc).toHaveBeenCalledWith('save_appointment_details', {
      p_date_time: '2026-11-05T14:30:00',
      p_practitioner_name: 'Dr Lee',
      p_health_service: 'GP',
      p_appointment_id: 7,
    });
  });

  it('maps NOT_FOUND and a validation message from the database', async () => {
    const notFound = await updateAppointmentDetails(
      9,
      NEW_INPUT,
      fakeClient({ rpc: rpcResult(null, dbError('NOT_FOUND')) }),
    );
    expect(notFound).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
    const tooLong = await createAppointment(
      NEW_INPUT,
      fakeClient({ rpc: rpcResult(null, dbError('VALUE_TOO_LONG')) }),
    );
    expect(tooLong).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'VALUE_TOO_LONG' } });
  });
});

describe('markAppointmentSaved', () => {
  it('calls save_appointment with the id', async () => {
    const rpc = rpcResult(null);
    const result = await markAppointmentSaved(7, fakeClient({ rpc }));
    expect(result).toEqual({ ok: true, data: undefined });
    expect(rpc).toHaveBeenCalledWith('save_appointment', { p_appointment_id: 7 });
  });

  it('succeeds when retried after a lost response', async () => {
    const rpc = jest
      .fn()
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce({ data: null, error: null });
    const client = fakeClient({ rpc });
    expect(await markAppointmentSaved(7, client)).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
    expect(await markAppointmentSaved(7, client)).toEqual({ ok: true, data: undefined });
  });

  it('maps NO_QUESTIONS to a validation error', async () => {
    const result = await markAppointmentSaved(
      7,
      fakeClient({ rpc: rpcResult(null, dbError('NO_QUESTIONS')) }),
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'NO_QUESTIONS' } });
  });
});

describe('getSupportPeople', () => {
  it('reads the people linked to the appointment', async () => {
    const links = table({ data: [{ support_persons: personRow() }], error: null });
    const from = fromTables({ appointment_has_support_persons: links });
    const result = await getSupportPeople(7, fakeClient({ from }));
    expect(from).toHaveBeenCalledWith('appointment_has_support_persons');
    expect(links.eq).toHaveBeenCalledWith('appointment_id', 7);
    expect(result).toEqual({
      ok: true,
      data: [
        {
          supportPersonId: 4,
          name: 'Bron',
          phone: '+61411111111',
          email: 'b@example.com',
          canAddQuestions: true,
          canAddAnswers: false,
        },
      ],
    });
  });

  it('gives an empty list when nobody is linked', async () => {
    const from = fromTables({ appointment_has_support_persons: table({ data: [], error: null }) });
    expect(await getSupportPeople(7, fakeClient({ from }))).toEqual({ ok: true, data: [] });
  });
});

describe('saveSupportPeople', () => {
  const newPerson = {
    name: 'Bron',
    phone: '+61411111111',
    email: null,
    canAddQuestions: true,
    canAddAnswers: false,
  };

  it('sends new people in full and stored people by id, and returns the saved list with ids', async () => {
    const rpc = rpcResult([personRow(), personRow({ support_person_id: 5, name: 'Sam', access_type: 'answers' })]);
    const result = await saveSupportPeople(
      7,
      [newPerson, { ...newPerson, supportPersonId: 5, name: 'Sam' }],
      fakeClient({ rpc }),
    );
    expect(rpc).toHaveBeenCalledWith('save_appointment_support_people', {
      p_appointment_id: 7,
      p_people: [
        { name: 'Bron', phone: '+61411111111', email: '', access_type: 'questions' },
        { support_person_id: 5 },
      ],
    });
    expect(result.ok && result.data.map((p) => [p.supportPersonId, p.name])).toEqual([
      [4, 'Bron'],
      [5, 'Sam'],
    ]);
  });

  it('sends an empty list to mean no support person', async () => {
    const rpc = rpcResult([]);
    expect(await saveSupportPeople(7, [], fakeClient({ rpc }))).toEqual({ ok: true, data: [] });
    expect(rpc).toHaveBeenCalledWith('save_appointment_support_people', {
      p_appointment_id: 7,
      p_people: [],
    });
  });

  it('makes no call for three people', async () => {
    const rpc = rpcResult([]);
    const result = await saveSupportPeople(7, [newPerson, newPerson, newPerson], fakeClient({ rpc }));
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', detail: 'TOO_MANY_SUPPORT_PEOPLE' },
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('makes no call for a landline or a blank name', async () => {
    const rpc = rpcResult([]);
    const client = fakeClient({ rpc });
    expect(await saveSupportPeople(7, [{ ...newPerson, phone: '+61291234567' }], client)).toMatchObject({
      ok: false,
      error: { code: 'INVALID_PHONE' },
    });
    expect(await saveSupportPeople(7, [{ ...newPerson, name: '  ' }], client)).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', detail: 'INVALID_SUPPORT_PERSON' },
    });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('maps a database refusal of a third person', async () => {
    const result = await saveSupportPeople(
      7,
      [newPerson],
      fakeClient({ rpc: rpcResult(null, dbError('TOO_MANY_SUPPORT_PEOPLE')) }),
    );
    expect(result).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', detail: 'TOO_MANY_SUPPORT_PEOPLE' },
    });
  });

  it('never sends a patient or user id', async () => {
    const rpc = rpcResult([]);
    await saveSupportPeople(7, [newPerson], fakeClient({ rpc }));
    expect(sentArgs(rpc)).not.toMatch(/patient_id|users_id/);
  });
});

describe('listMySupportPersons, saveSupportPerson and deleteSupportPerson', () => {
  const person = {
    name: 'Bron',
    phone: '+61411111111',
    email: 'b@example.com',
    canAddQuestions: true,
    canAddAnswers: true,
  };

  it('lists the patient’s support people', async () => {
    const rpc = rpcResult([personRow({ access_type: 'questions,answers' })]);
    const result = await listMySupportPersons(fakeClient({ rpc }));
    expect(rpc).toHaveBeenCalledWith('list_my_support_persons');
    expect(result.ok && result.data[0]).toMatchObject({
      supportPersonId: 4,
      canAddQuestions: true,
      canAddAnswers: true,
    });
  });

  it('adds a person without an id and returns the stored one', async () => {
    const rpc = rpcResult(personRow({ access_type: 'questions,answers' }));
    const result = await saveSupportPerson(person, fakeClient({ rpc }));
    expect(rpc).toHaveBeenCalledWith('save_support_person', {
      p_name: 'Bron',
      p_phone: '+61411111111',
      p_email: 'b@example.com',
      p_access_type: 'questions,answers',
    });
    expect(result.ok && result.data.supportPersonId).toBe(4);
  });

  it('edits a person by id and sends blanks for missing contact details', async () => {
    const rpc = rpcResult(personRow());
    await saveSupportPerson(
      { ...person, supportPersonId: 4, phone: null, email: null, canAddAnswers: false },
      fakeClient({ rpc }),
    );
    expect(rpc).toHaveBeenCalledWith('save_support_person', {
      p_name: 'Bron',
      p_phone: '',
      p_email: '',
      p_access_type: 'questions',
      p_support_person_id: 4,
    });
  });

  it('makes no call for a landline, and maps a duplicate number', async () => {
    const rpc = rpcResult(personRow());
    expect(await saveSupportPerson({ ...person, phone: '0291234567' }, fakeClient({ rpc }))).toMatchObject({
      ok: false,
      error: { code: 'INVALID_PHONE' },
    });
    expect(rpc).not.toHaveBeenCalled();
    const duplicate = await saveSupportPerson(
      person,
      fakeClient({ rpc: rpcResult(null, dbError('DUPLICATE_SUPPORT_PERSON')) }),
    );
    expect(duplicate).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION', detail: 'DUPLICATE_SUPPORT_PERSON' },
    });
  });

  it('deletes a person by id', async () => {
    const people = table({ data: null, error: null });
    const from = fromTables({ support_persons: people });
    expect(await deleteSupportPerson(4, fakeClient({ from }))).toEqual({ ok: true, data: undefined });
    expect(people.delete).toHaveBeenCalled();
    expect(people.eq).toHaveBeenCalledWith('support_person_id', 4);
  });

  it('maps a failed delete', async () => {
    const from = fromTables({ support_persons: table({ data: null, error: dbError('boom', '42501') }) });
    expect(await deleteSupportPerson(4, fakeClient({ from }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_ALLOWED' },
    });
  });
});

describe('getQuestionSuggestions', () => {
  const completeAssessments = (): AssessmentSet => {
    const base = { submissionId: 1, date: '2026-10-20', weekStart: '2026-10-19' };
    return {
      pain: {
        ...base,
        current: 0,
        mildest: 2,
        worst: 9,
        average: 7,
        locations: ['lower back', 'neck', 'knee'],
        characteristics: [],
      },
      movement: {
        ...base,
        averageActiveHours: 3,
        generalImpacts: [],
        walking: 'a',
        lifting: 'a',
        sitting: 'a',
        standing: 'a',
      },
      personalCare: { ...base, generalActivities: [], washingDressing: 'a', sleeping: 'a' },
      socialHealth: {
        ...base,
        socialLife: 'a',
        travelling: 'a',
        mood: 3,
        relationWithOthers: 3,
        enjoymentOfLife: 3,
        moodOverall: 'a',
      },
      management: { ...base, exercise: 'a', emotion: null, medications: [] },
    };
  };

  beforeEach(() => {
    mockGetAssessments.mockReset();
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it('returns stored questions without generating anything', async () => {
    const appointment = table({
      data: {
        appointment_id: 7,
        status: 'draft',
        suggestions_generated_on: '2026-10-27',
        appointment_questions: [
          questionRow(1, { is_selected: true, answer: 'Rest' }),
          questionRow(2, { sort_order: 2 }),
        ],
      },
      error: null,
    });
    const rpc = rpcResult(true);
    const result = await getQuestionSuggestions(7, fakeClient({ from: fromTables({ appointment }), rpc }));
    expect(rpc).not.toHaveBeenCalled();
    expect(mockGetAssessments).not.toHaveBeenCalled();
    expect(result.ok && result.data).toMatchObject({
      appointmentStatus: 'draft',
      generatedOn: '2026-10-27',
      selectedQuestionIds: [1],
      answeredQuestionIds: [1],
    });
  });

  it('generates once when nothing is stored, with the local calendar date, then puts the defaults on the plan', async () => {
    // 12:30 am local on 5 Nov: in a zone ahead of UTC the UTC date is still 4 Nov, which must not be sent
    jest.setSystemTime(new Date(2026, 10, 5, 0, 30, 0));
    mockGetAssessments.mockResolvedValue({ ok: true, data: completeAssessments() });
    const stored = [1, 2, 3, 4, 5].map((id) => questionRow(id));
    const appointment = table(
      {
        data: { appointment_id: 7, status: 'draft', suggestions_generated_on: null, appointment_questions: [] },
        error: null,
      },
      {
        data: {
          appointment_id: 7,
          status: 'draft',
          suggestions_generated_on: '2026-11-05',
          appointment_questions: stored,
        },
        error: null,
      },
    );
    const rpc = jest.fn<Promise<{ data: unknown; error: null }>, [string, unknown?]>(async (name) =>
      name === 'save_appointment_suggestions' ? { data: true, error: null } : { data: null, error: null },
    );
    await getQuestionSuggestions(7, fakeClient({ from: fromTables({ appointment }), rpc }));

    expect(mockGetAssessments).toHaveBeenCalledWith({ kind: 'latest' }, expect.anything());
    const suggestionCalls = rpc.mock.calls.filter(([name]) => name === 'save_appointment_suggestions');
    expect(suggestionCalls).toHaveLength(1);
    const args = suggestionCalls[0][1] as unknown as {
      p_appointment_id: number;
      p_generated_on: string;
      p_questions: { group_key: string; question: string }[];
    };
    expect(args.p_appointment_id).toBe(7);
    expect(args.p_generated_on).toBe('2026-11-05');
    expect(args.p_questions[0]).toEqual({
      group_key: 'pain-location',
      question: 'What could be causing pain in my lower back, neck, and knee?',
    });
    expect(Object.keys(args.p_questions[0]).sort()).toEqual(['group_key', 'question']);
    expect(sentArgs(rpc)).not.toMatch(/patient_id|users_id/);
  });

  it('selects the default questions after storing and reflects that in the result', async () => {
    mockGetAssessments.mockResolvedValue({ ok: true, data: completeAssessments() });
    const stored = [
      questionRow(1, { question: 'What could be causing pain in my lower back, neck, and knee?' }),
      questionRow(2, { question: 'Is it normal for pain to vary between mild (2) and very severe (9)?' }),
    ];
    const appointment = table(
      {
        data: { appointment_id: 7, status: 'draft', suggestions_generated_on: null, appointment_questions: [] },
        error: null,
      },
      {
        data: {
          appointment_id: 7,
          status: 'draft',
          suggestions_generated_on: '2026-10-27',
          appointment_questions: stored,
        },
        error: null,
      },
    );
    const rpc = jest.fn(async (name: string) =>
      name === 'save_appointment_suggestions' ? { data: true, error: null } : { data: null, error: null },
    );
    const result = await getQuestionSuggestions(7, fakeClient({ from: fromTables({ appointment }), rpc }));
    expect(rpc).toHaveBeenCalledWith('save_appointment_questions', {
      p_appointment_id: 7,
      p_question_ids: [1],
    });
    expect(result.ok && result.data.selectedQuestionIds).toEqual([1]);
  });

  it('does not change the plan when another call stored the questions first', async () => {
    mockGetAssessments.mockResolvedValue({ ok: true, data: completeAssessments() });
    const appointment = table(
      {
        data: { appointment_id: 7, status: 'draft', suggestions_generated_on: null, appointment_questions: [] },
        error: null,
      },
      {
        data: {
          appointment_id: 7,
          status: 'draft',
          suggestions_generated_on: '2026-10-27',
          appointment_questions: [questionRow(1, { is_selected: true })],
        },
        error: null,
      },
    );
    const rpc = jest.fn(async () => ({ data: false, error: null }));
    const result = await getQuestionSuggestions(7, fakeClient({ from: fromTables({ appointment }), rpc }));
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(result.ok && result.data.selectedQuestionIds).toEqual([1]);
  });

  it('stores nothing when no questions can be generated yet', async () => {
    mockGetAssessments.mockResolvedValue({
      ok: true,
      data: { pain: null, movement: null, personalCare: null, socialHealth: null, management: null },
    });
    const appointment = table({
      data: { appointment_id: 7, status: 'draft', suggestions_generated_on: null, appointment_questions: [] },
      error: null,
    });
    const rpc = rpcResult(true);
    const result = await getQuestionSuggestions(7, fakeClient({ from: fromTables({ appointment }), rpc }));
    expect(rpc).not.toHaveBeenCalled();
    expect(result.ok && result.data).toMatchObject({ generatedOn: null, groups: [] });
  });

  it('fails with NOT_FOUND for an appointment that does not exist', async () => {
    const appointment = table({ data: null, error: null });
    const result = await getQuestionSuggestions(99, fakeClient({ from: fromTables({ appointment }) }));
    expect(result).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });

  it('passes on a failure to read the assessments', async () => {
    mockGetAssessments.mockResolvedValue({ ok: false, error: { code: 'NETWORK', message: 'x' } });
    const appointment = table({
      data: { appointment_id: 7, status: 'draft', suggestions_generated_on: null, appointment_questions: [] },
      error: null,
    });
    const rpc = rpcResult(true);
    const result = await getQuestionSuggestions(7, fakeClient({ from: fromTables({ appointment }), rpc }));
    expect(result).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
    expect(rpc).not.toHaveBeenCalled();
  });
});

describe('saveAppointmentQuestions', () => {
  it('sends the chosen ids', async () => {
    const rpc = rpcResult(null);
    const result = await saveAppointmentQuestions(7, [1, 3], fakeClient({ rpc }));
    expect(result).toEqual({ ok: true, data: undefined });
    expect(rpc).toHaveBeenCalledWith('save_appointment_questions', {
      p_appointment_id: 7,
      p_question_ids: [1, 3],
    });
  });

  it('makes no call when no question is chosen', async () => {
    const rpc = rpcResult(null);
    const result = await saveAppointmentQuestions(7, [], fakeClient({ rpc }));
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'NO_QUESTIONS' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('maps an unknown question and a missing appointment', async () => {
    const unknown = await saveAppointmentQuestions(
      7,
      [99],
      fakeClient({ rpc: rpcResult(null, dbError('UNKNOWN_QUESTION')) }),
    );
    expect(unknown).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'UNKNOWN_QUESTION' } });
    const missing = await saveAppointmentQuestions(
      7,
      [1],
      fakeClient({ rpc: rpcResult(null, dbError('NOT_FOUND')) }),
    );
    expect(missing).toMatchObject({ ok: false, error: { code: 'NOT_FOUND' } });
  });
});

describe('saveRecordingConsent', () => {
  const signature = '{"w":313,"h":200,"paths":["M10.5 20.1L11 21.4"]}';

  it('sends the signature and returns the time the server recorded', async () => {
    const rpc = rpcResult('2026-11-01T03:00:00+00:00');
    const result = await saveRecordingConsent({ appointmentId: 7, signature }, fakeClient({ rpc }));
    expect(result).toEqual({ ok: true, data: '2026-11-01T03:00:00+00:00' });
    expect(rpc).toHaveBeenCalledWith('save_recording_consent', {
      p_appointment_id: 7,
      p_signature: signature,
    });
  });

  it('makes no call for a signature over 60000 characters', async () => {
    const rpc = rpcResult('x');
    const result = await saveRecordingConsent(
      { appointmentId: 7, signature: 'x'.repeat(60001) },
      fakeClient({ rpc }),
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'INVALID_SIGNATURE' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('maps a rejected signature', async () => {
    const result = await saveRecordingConsent(
      { appointmentId: 7, signature },
      fakeClient({ rpc: rpcResult(null, dbError('INVALID_SIGNATURE')) }),
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'INVALID_SIGNATURE' } });
  });
});

describe('getAppointmentPlan', () => {
  it('maps the appointment, its chosen questions with answers, and its support people', async () => {
    const appointment = table({
      data: {
        appointment_id: 7,
        date_time: '2026-11-05T14:30:00',
        practitioner_name: 'Dr Lee',
        health_service: 'GP',
        status: 'saved',
        recording_consent_at: '2026-11-01T03:00:00+00:00',
        appointment_questions: [
          questionRow(1, { is_selected: true, answer: 'Rest' }),
          questionRow(2, { sort_order: 2 }),
        ],
        appointment_has_support_persons: [{ support_persons: personRow() }],
      },
      error: null,
    });
    const from = fromTables({ appointment });
    const result = await getAppointmentPlan(7, fakeClient({ from }));
    expect(appointment.eq).toHaveBeenCalledWith('appointment_id', 7);
    expect(result.ok && result.data).toMatchObject({
      appointment: { appointmentId: 7, dateTime: '2026-11-05T14:30:00', status: 'saved' },
      supportPersonName: 'Bron',
      recordingConsentedAt: '2026-11-01T03:00:00+00:00',
      questionGroups: [
        {
          groupId: 'pain-location',
          questions: [{ questionId: 1, text: 'Q1', doctorAnswer: 'Rest' }],
        },
      ],
    });
  });

  it('fails with NOT_FOUND when the appointment is not visible', async () => {
    const from = fromTables({ appointment: table({ data: null, error: null }) });
    expect(await getAppointmentPlan(99, fakeClient({ from }))).toMatchObject({
      ok: false,
      error: { code: 'NOT_FOUND' },
    });
  });
});

describe('saveAnswers', () => {
  it('sends question_id and answer_text for each answer', async () => {
    const rpc = rpcResult(null);
    const result = await saveAnswers(
      7,
      [
        { questionId: 1, answerText: '  Take rest ' },
        { questionId: 3, answerText: '' },
      ],
      fakeClient({ rpc }),
    );
    expect(result).toEqual({ ok: true, data: undefined });
    expect(rpc).toHaveBeenCalledWith('save_appointment_answers', {
      p_appointment_id: 7,
      p_answers: [
        { question_id: 1, answer_text: '  Take rest ' },
        { question_id: 3, answer_text: '' },
      ],
    });
  });

  it('makes no call for no answers or an answer over 4000 characters', async () => {
    const rpc = rpcResult(null);
    const client = fakeClient({ rpc });
    expect(await saveAnswers(7, [], client)).toEqual({ ok: true, data: undefined });
    expect(
      await saveAnswers(7, [{ questionId: 1, answerText: 'x'.repeat(4001) }], client),
    ).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'VALUE_TOO_LONG' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it('accepts an answer of exactly 4000 characters', async () => {
    const rpc = rpcResult(null);
    const result = await saveAnswers(7, [{ questionId: 1, answerText: 'x'.repeat(4000) }], fakeClient({ rpc }));
    expect(result.ok).toBe(true);
  });

  it('surfaces CONSENT_REQUIRED as its own error', async () => {
    const result = await saveAnswers(
      7,
      [{ questionId: 1, answerText: 'hi' }],
      fakeClient({ rpc: rpcResult(null, dbError('CONSENT_REQUIRED')) }),
    );
    expect(result).toMatchObject({ ok: false, error: { code: 'CONSENT_REQUIRED' } });
  });

  it('maps a question that is not on the plan, and a lost connection', async () => {
    const off = await saveAnswers(
      7,
      [{ questionId: 2, answerText: 'hi' }],
      fakeClient({ rpc: rpcResult(null, dbError('QUESTION_NOT_ON_PLAN')) }),
    );
    expect(off).toMatchObject({ ok: false, error: { code: 'VALIDATION', detail: 'QUESTION_NOT_ON_PLAN' } });
    const lost = await saveAnswers(
      7,
      [{ questionId: 1, answerText: 'hi' }],
      fakeClient({ rpc: jest.fn().mockRejectedValue(new TypeError('Network request failed')) }),
    );
    expect(lost).toMatchObject({ ok: false, error: { code: 'NETWORK' } });
  });
});
