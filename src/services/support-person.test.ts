jest.mock('@/lib/supabase', () => ({ supabase: {} })); // must be above the imports that use it

import {
  acceptSupportRequest,
  getSupportedAppointmentPlan,
  getSupportedQuestionSuggestions,
  listSupportedPatients,
  listSupportRequests,
  rejectSupportRequest,
  saveSupportedAnswers,
  saveSupportedQuestions,
  unpairFromPatient,
} from './support-person';

type Reply = { data: unknown; error: unknown };

/** A fake client whose rpc answers each function name with the given reply. */
function clientWith(replies: Record<string, Reply>) {
  const rpc = jest.fn((name: string) => Promise.resolve(replies[name] ?? { data: null, error: null }));
  return { rpc, client: { rpc } as never };
}

const dbError = (message: string) => ({ code: 'P0001', message });

const patientRow = {
  patient_id: 7,
  patient_name: 'Alice',
  conditions: 'Arthritis',
  can_add_questions: true,
  can_add_answers: false,
};
const appointmentRow = (appointment_id: number, patient_id = 7) => ({
  patient_id,
  appointment_id,
  date_time: '2026-11-05 14:30:00',
  practitioner_name: 'Dr Lee',
  health_service: 'GP',
  status: 'saved',
});
const supportedAppointment = {
  appointment_id: 21,
  patient_id: 7,
  date_time: '2026-11-05T14:30:00',
  practitioner_name: 'Dr Lee',
  health_service: 'GP',
  status: 'saved',
  recording_consent_at: null,
  suggestions_generated_on: '2026-10-29',
  can_add_questions: true,
  can_add_answers: false,
};
const questionRows = [
  { question_id: 1, group_key: 'pain-location', sort_order: 1, question: 'Q1', is_selected: true, answer: 'Rest' },
  { question_id: 2, group_key: 'pain-location', sort_order: 2, question: 'Q2', is_selected: false, answer: null },
];

describe('listSupportedPatients', () => {
  it('reads patients and appointments together and puts each appointment under its patient', async () => {
    const { rpc, client } = clientWith({
      list_supported_patients: { data: [patientRow, { ...patientRow, patient_id: 9, patient_name: 'Bob' }], error: null },
      list_supported_appointments: { data: [appointmentRow(21), appointmentRow(22, 9)], error: null },
    });
    const result = await listSupportedPatients(client);
    expect(rpc).toHaveBeenCalledWith('list_supported_patients');
    expect(rpc).toHaveBeenCalledWith('list_supported_appointments');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.map((p) => [p.id, p.appointments.map((a) => a.appointmentId)])).toEqual([
        ['7', [21]],
        ['9', [22]],
      ]);
      // dates stay local wall-clock strings
      expect(result.data[0].appointments[0].dateTime).toBe('2026-11-05T14:30:00');
    }
  });

  it('gives a patient with no appointments an empty list', async () => {
    const { client } = clientWith({
      list_supported_patients: { data: [patientRow], error: null },
      list_supported_appointments: { data: [], error: null },
    });
    const result = await listSupportedPatients(client);
    expect(result.ok && result.data[0].appointments).toEqual([]);
  });

  it('maps an error from either call', async () => {
    const { client } = clientWith({
      list_supported_patients: { data: [patientRow], error: null },
      list_supported_appointments: { data: null, error: { message: 'Network request failed' } },
    });
    const result = await listSupportedPatients(client);
    expect(result.ok).toBe(false);
  });
});

describe('listSupportRequests', () => {
  it('maps each request to a patient with no condition and no appointments', async () => {
    const { client } = clientWith({
      list_my_support_requests: {
        data: [{ patient_id: 7, patient_name: 'Alice', can_add_questions: false, can_add_answers: true }],
        error: null,
      },
    });
    const result = await listSupportRequests(client);
    expect(result).toEqual({
      ok: true,
      data: [
        {
          id: '7',
          patient: { id: '7', name: 'Alice', condition: '', canAddQuestions: false, canAddAnswers: true, appointments: [] },
        },
      ],
    });
  });
});

describe('acceptSupportRequest', () => {
  it('sends the patient id as a number and returns the patient with their appointments', async () => {
    const { rpc, client } = clientWith({
      accept_support_request: { data: [patientRow], error: null },
      list_supported_appointments: { data: [appointmentRow(21), appointmentRow(30, 9)], error: null },
    });
    const result = await acceptSupportRequest('7', client);
    expect(rpc).toHaveBeenCalledWith('accept_support_request', { p_patient_id: 7 });
    expect(result.ok && result.data.id).toBe('7');
    expect(result.ok && result.data.appointments.map((a) => a.appointmentId)).toEqual([21]);
  });

  it('refuses an id that cannot be a patient without calling the database', async () => {
    const { rpc, client } = clientWith({});
    const result = await acceptSupportRequest('request-1', client);
    expect(result).toEqual({ ok: false, error: { code: 'NOT_FOUND', message: 'REQUEST_NOT_FOUND' } });
    expect(rpc).not.toHaveBeenCalled();
  });

  it.each([
    ['REQUEST_NOT_FOUND', 'NOT_FOUND'],
    ['NOT_A_SUPPORT_PERSON', 'NOT_ALLOWED'],
  ])('maps %s to %s and keeps the message', async (message, code) => {
    const { client } = clientWith({ accept_support_request: { data: null, error: dbError(message) } });
    const result = await acceptSupportRequest('7', client);
    expect(result).toEqual({ ok: false, error: { code, message } });
  });
});

describe('rejectSupportRequest and unpairFromPatient', () => {
  it('reject sends the patient id as a number', async () => {
    const { rpc, client } = clientWith({ reject_support_request: { data: null, error: null } });
    expect(await rejectSupportRequest('7', client)).toEqual({ ok: true, data: undefined });
    expect(rpc).toHaveBeenCalledWith('reject_support_request', { p_patient_id: 7 });
  });

  it('unpair sends the patient id as a number', async () => {
    const { rpc, client } = clientWith({ unpair_from_patient: { data: null, error: null } });
    expect(await unpairFromPatient('7', client)).toEqual({ ok: true, data: undefined });
    expect(rpc).toHaveBeenCalledWith('unpair_from_patient', { p_patient_id: 7 });
  });

  it('unpair maps PATIENT_NOT_FOUND and refuses a bad id without a call', async () => {
    const { client } = clientWith({ unpair_from_patient: { data: null, error: dbError('PATIENT_NOT_FOUND') } });
    expect(await unpairFromPatient('7', client)).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'PATIENT_NOT_FOUND' },
    });
    const empty = clientWith({});
    expect((await unpairFromPatient('', empty.client)).ok).toBe(false);
    expect(empty.rpc).not.toHaveBeenCalled();
  });
});

describe('getSupportedAppointmentPlan', () => {
  it('reads the appointment and its questions and keeps only the questions on the plan', async () => {
    const { rpc, client } = clientWith({
      get_supported_appointment: { data: [supportedAppointment], error: null },
      list_supported_appointment_questions: { data: questionRows, error: null },
    });
    const result = await getSupportedAppointmentPlan(21, client);
    expect(rpc).toHaveBeenCalledWith('get_supported_appointment', { p_appointment_id: 21 });
    expect(rpc).toHaveBeenCalledWith('list_supported_appointment_questions', { p_appointment_id: 21 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.supportPersonName).toBeNull();
      expect(result.data.recordingConsentedAt).toBeNull();
      expect(result.data.questionGroups.flatMap((g) => g.questions)).toEqual([
        { questionId: 1, text: 'Q1', doctorAnswer: 'Rest' },
      ]);
    }
  });

  it('turns zero rows into APPOINTMENT_NOT_FOUND', async () => {
    const { client } = clientWith({
      get_supported_appointment: { data: [], error: null },
      list_supported_appointment_questions: { data: [], error: null },
    });
    expect(await getSupportedAppointmentPlan(21, client)).toEqual({
      ok: false,
      error: { code: 'NOT_FOUND', message: 'APPOINTMENT_NOT_FOUND' },
    });
  });
});

describe('getSupportedQuestionSuggestions', () => {
  it('lists every stored question with the chosen and answered ones', async () => {
    const { client } = clientWith({
      get_supported_appointment: { data: [supportedAppointment], error: null },
      list_supported_appointment_questions: { data: questionRows, error: null },
    });
    const result = await getSupportedQuestionSuggestions(21, client);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.generatedOn).toBe('2026-10-29');
      expect(result.data.groups.flatMap((g) => g.questions.map((q) => q.questionId))).toEqual([1, 2]);
      expect(result.data.selectedQuestionIds).toEqual([1]);
      expect(result.data.answeredQuestionIds).toEqual([1]);
    }
  });

  it('gives a null generatedOn when no questions were generated', async () => {
    const { client } = clientWith({
      get_supported_appointment: { data: [{ ...supportedAppointment, suggestions_generated_on: null }], error: null },
      list_supported_appointment_questions: { data: [], error: null },
    });
    const result = await getSupportedQuestionSuggestions(21, client);
    expect(result.ok && result.data.generatedOn).toBeNull();
  });
});

describe('saveSupportedQuestions', () => {
  it('sends the appointment and question ids', async () => {
    const { rpc, client } = clientWith({ save_supported_questions: { data: null, error: null } });
    expect(await saveSupportedQuestions(21, [1, 3], client)).toEqual({ ok: true, data: undefined });
    expect(rpc).toHaveBeenCalledWith('save_supported_questions', { p_appointment_id: 21, p_question_ids: [1, 3] });
  });

  it.each([
    ['NO_QUESTIONS_PERMISSION', 'NOT_ALLOWED'],
    ['NO_ANSWERS_PERMISSION', 'NOT_ALLOWED'],
    ['APPOINTMENT_NOT_FOUND', 'NOT_FOUND'],
  ])('maps %s to %s and keeps the message for the screen', async (message, code) => {
    const { client } = clientWith({ save_supported_questions: { data: null, error: dbError(message) } });
    expect(await saveSupportedQuestions(21, [1], client)).toEqual({ ok: false, error: { code, message } });
  });

  it('maps NO_QUESTIONS as a validation error', async () => {
    const { client } = clientWith({ save_supported_questions: { data: null, error: dbError('NO_QUESTIONS') } });
    const result = await saveSupportedQuestions(21, [], client);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.code).toBe('VALIDATION');
  });
});

describe('saveSupportedAnswers', () => {
  it('sends { question_id, answer_text } items, including an empty answer to clear one', async () => {
    const { rpc, client } = clientWith({ save_supported_answers: { data: null, error: null } });
    const result = await saveSupportedAnswers(
      21,
      [
        { questionId: 1, answerText: 'Rest' },
        { questionId: 3, answerText: '' },
      ],
      client,
    );
    expect(result).toEqual({ ok: true, data: undefined });
    expect(rpc).toHaveBeenCalledWith('save_supported_answers', {
      p_appointment_id: 21,
      p_answers: [
        { question_id: 1, answer_text: 'Rest' },
        { question_id: 3, answer_text: '' },
      ],
    });
  });

  it('maps CONSENT_REQUIRED and NO_ANSWERS_PERMISSION', async () => {
    const consent = clientWith({ save_supported_answers: { data: null, error: dbError('CONSENT_REQUIRED') } });
    const consentResult = await saveSupportedAnswers(21, [{ questionId: 1, answerText: 'x' }], consent.client);
    expect(!consentResult.ok && consentResult.error.code).toBe('CONSENT_REQUIRED');

    const permission = clientWith({ save_supported_answers: { data: null, error: dbError('NO_ANSWERS_PERMISSION') } });
    expect(await saveSupportedAnswers(21, [{ questionId: 1, answerText: 'x' }], permission.client)).toEqual({
      ok: false,
      error: { code: 'NOT_ALLOWED', message: 'NO_ANSWERS_PERMISSION' },
    });
  });

  it('returns an error instead of throwing when the connection fails', async () => {
    const rpc = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    const result = await saveSupportedAnswers(21, [], { rpc } as never);
    expect(result.ok).toBe(false);
  });
});
