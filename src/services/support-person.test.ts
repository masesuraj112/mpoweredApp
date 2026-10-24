import type { AppointmentPlan } from '@/features/care-planner/planTypes';

import {
  acceptSupportRequest,
  getSupportedAppointmentPlan,
  getSupportedQuestionSuggestions,
  listSupportedPatients,
  listSupportRequests,
  rejectSupportRequest,
  resetMockSupportedPlans,
  resetMockSupportPerson,
  saveSupportedAnswers,
  saveSupportedQuestions,
  unpairFromPatient,
} from './support-person';

beforeEach(() => resetMockSupportPerson());

const ids = <T extends { id: string }>(items: T[]) => items.map(item => item.id);

async function patientIds() {
  const result = await listSupportedPatients();
  if (!result.ok) throw new Error('listSupportedPatients failed');
  return ids(result.data);
}

async function requestIds() {
  const result = await listSupportRequests();
  if (!result.ok) throw new Error('listSupportRequests failed');
  return ids(result.data);
}

describe('listSupportedPatients and listSupportRequests', () => {
  it('start with the sample data', async () => {
    expect(await patientIds()).toEqual(['jane-cooper', 'steven-harper']);
    expect(await requestIds()).toEqual(['request-1', 'request-2']);
  });

  it('return copies, so changing a result does not change the store', async () => {
    const result = await listSupportedPatients();
    if (result.ok) result.data.pop();
    expect(await patientIds()).toHaveLength(2);
  });
});

describe('acceptSupportRequest', () => {
  it('removes the request and adds the patient', async () => {
    const result = await acceptSupportRequest('request-1');
    expect(result.ok && result.data.id).toBe('maria-lopez');
    expect(await requestIds()).toEqual(['request-2']);
    expect(await patientIds()).toContain('maria-lopez');
  });

  it('fails for an unknown request and changes nothing', async () => {
    const result = await acceptSupportRequest('nope');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('REQUEST_NOT_FOUND');
    expect(await requestIds()).toHaveLength(2);
  });
});

describe('rejectSupportRequest', () => {
  it('removes the request without adding the patient', async () => {
    expect((await rejectSupportRequest('request-1')).ok).toBe(true);
    expect(await requestIds()).toEqual(['request-2']);
    expect(await patientIds()).not.toContain('maria-lopez');
  });

  it('fails for an unknown request', async () => {
    expect((await rejectSupportRequest('nope')).ok).toBe(false);
  });
});

describe('unpairFromPatient', () => {
  it('removes the patient', async () => {
    expect((await unpairFromPatient('jane-cooper')).ok).toBe(true);
    expect(await patientIds()).toEqual(['steven-harper']);
  });

  it('fails for a patient who is not supported', async () => {
    const result = await unpairFromPatient('nope');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('PATIENT_NOT_FOUND');
  });
});

describe('appointment plans', () => {
  beforeEach(() => resetMockSupportedPlans());

  // Jane (101 upcoming, 102 past): questions only. Steven (111 past): both. Tom (131, after his
  // request is accepted): answers only.
  const plan = async (appointmentId: number) => {
    const result = await getSupportedAppointmentPlan(appointmentId);
    if (!result.ok) throw new Error(result.error.message);
    return result.data;
  };
  const questionIds = (p: AppointmentPlan) => p.questionGroups.flatMap(g => g.questions.map(q => q.questionId));
  const answered = (p: AppointmentPlan) =>
    p.questionGroups.flatMap(g => g.questions.filter(q => q.doctorAnswer !== null).map(q => q.questionId));

  it('returns the plan for a supported patient’s appointment', async () => {
    const result = await plan(101);
    expect(result.appointment.appointmentId).toBe(101);
    expect(questionIds(result)).toEqual([1, 3, 5]);
  });

  it('starts past appointments with answers and consent, and upcoming ones without', async () => {
    expect(answered(await plan(102))).toEqual([1, 5]);
    expect((await plan(102)).recordingConsentedAt).not.toBeNull();
    expect(answered(await plan(101))).toEqual([]);
    expect((await plan(101)).recordingConsentedAt).toBeNull();
  });

  it('fails for an appointment of someone the user does not support', async () => {
    const result = await getSupportedAppointmentPlan(1);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.message).toBe('APPOINTMENT_NOT_FOUND');
  });

  it('stops finding a patient’s appointments after unpairing', async () => {
    await unpairFromPatient('jane-cooper');
    expect((await getSupportedAppointmentPlan(101)).ok).toBe(false);
  });

  describe('saveSupportedAnswers', () => {
    it('saves and clears answers with the answers permission', async () => {
      expect((await saveSupportedAnswers(111, [{ questionId: 3, answerText: '  Rest and heat. ' }])).ok).toBe(true);
      expect(answered(await plan(111))).toEqual([1, 3, 5]);
      await saveSupportedAnswers(111, [{ questionId: 1, answerText: '' }]);
      expect(answered(await plan(111))).toEqual([3, 5]);
    });

    it('is refused without the answers permission', async () => {
      const result = await saveSupportedAnswers(101, [{ questionId: 1, answerText: 'x' }]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.code).toBe('NOT_ALLOWED');
    });

    it('rejects a question that is not on the plan', async () => {
      const result = await saveSupportedAnswers(111, [{ questionId: 2, answerText: 'x' }]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.message).toBe('QUESTION_NOT_ON_PLAN');
    });
  });

  describe('getSupportedQuestionSuggestions', () => {
    it('lists every suggestion with what is chosen and answered', async () => {
      const result = await getSupportedQuestionSuggestions(102);
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.data.groups.flatMap(g => g.questions)).toHaveLength(7);
      expect(result.data.selectedQuestionIds).toEqual([1, 3, 5]);
      expect(result.data.answeredQuestionIds).toEqual([1, 5]);
    });
  });

  describe('saveSupportedQuestions', () => {
    it('adds questions with the questions permission', async () => {
      expect((await saveSupportedQuestions(101, [1, 2, 3, 5])).ok).toBe(true);
      expect(questionIds(await plan(101))).toEqual([1, 2, 3, 5]);
    });

    it('is refused without the questions permission', async () => {
      await acceptSupportRequest('request-2');
      const result = await saveSupportedQuestions(131, [1]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.message).toBe('NO_QUESTIONS_PERMISSION');
    });

    it('lets someone with both permissions remove an answered question, removing its answer', async () => {
      expect((await saveSupportedQuestions(111, [3, 5])).ok).toBe(true);
      expect(answered(await plan(111))).toEqual([5]);
    });

    it('refuses removing an answered question without the answers permission', async () => {
      const result = await saveSupportedQuestions(102, [3, 5]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.message).toBe('NO_ANSWERS_PERMISSION');
      expect(questionIds(await plan(102))).toEqual([1, 3, 5]);
    });

    it('rejects an unknown question id', async () => {
      const result = await saveSupportedQuestions(101, [99]);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error.message).toBe('UNKNOWN_QUESTION');
    });
  });
});
