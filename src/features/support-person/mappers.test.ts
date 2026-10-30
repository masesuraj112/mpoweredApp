import {
  mapSupportedPatient,
  mapSupportedPatients,
  mapSupportRequest,
  type SupportedAppointmentRow,
  type SupportedPatientRow,
} from './mappers';

const alice: SupportedPatientRow = {
  patient_id: 7,
  patient_name: 'Alice',
  conditions: 'Arthritis, Gout',
  can_add_questions: true,
  can_add_answers: false,
};

const appointment = (overrides: Partial<SupportedAppointmentRow>): SupportedAppointmentRow => ({
  patient_id: 7,
  appointment_id: 1,
  date_time: '2026-11-05T14:30:00',
  practitioner_name: 'Dr Lee',
  health_service: 'GP',
  status: 'saved',
  ...overrides,
});

describe('mapSupportedPatient', () => {
  it('uses the patient id as a string, and keeps the name, conditions and access', () => {
    expect(mapSupportedPatient(alice)).toEqual({
      id: '7',
      name: 'Alice',
      condition: 'Arthritis, Gout',
      canAddQuestions: true,
      canAddAnswers: false,
      appointments: [],
    });
  });

  it('gives an empty condition when the patient has none', () => {
    expect(mapSupportedPatient({ ...alice, conditions: null }).condition).toBe('');
  });

  it('keeps appointment dates as the same local wall-clock string', () => {
    const [mapped] = mapSupportedPatient(alice, [appointment({ date_time: '2026-11-05 14:30:00' })]).appointments;
    expect(mapped.dateTime).toBe('2026-11-05T14:30:00');
  });
});

describe('mapSupportedPatients', () => {
  it('puts each appointment under its own patient, in the order given', () => {
    const bob: SupportedPatientRow = { ...alice, patient_id: 9, patient_name: 'Bob', conditions: null };
    const patients = mapSupportedPatients(
      [alice, bob],
      [
        appointment({ appointment_id: 1, patient_id: 7 }),
        appointment({ appointment_id: 2, patient_id: 9 }),
        appointment({ appointment_id: 3, patient_id: 7 }),
      ],
    );
    expect(patients.map((p) => p.id)).toEqual(['7', '9']);
    expect(patients[0].appointments.map((a) => a.appointmentId)).toEqual([1, 3]);
    expect(patients[1].appointments.map((a) => a.appointmentId)).toEqual([2]);
  });

  it('gives a patient with no appointments an empty list', () => {
    expect(mapSupportedPatients([alice], [])[0].appointments).toEqual([]);
  });
});

describe('mapSupportRequest', () => {
  it('uses the patient id as the request id, with no condition and no appointments (S5)', () => {
    expect(
      mapSupportRequest({ patient_id: 7, patient_name: 'Alice', can_add_questions: false, can_add_answers: true }),
    ).toEqual({
      id: '7',
      patient: {
        id: '7',
        name: 'Alice',
        condition: '',
        canAddQuestions: false,
        canAddAnswers: true,
        appointments: [],
      },
    });
  });
});
