import { toProfileArgs, type OnboardingAnswers } from '@/features/auth/profile';

const patient: OnboardingAnswers = {
  name: '  Sam  ',
  userType: 'patient',
  sex: 'female',
  yearOfBirth: 1980,
  hasDiagnosis: true,
  conditions: ['Arthritis', ' Gout '],
  otherConditions: '  stiff in the morning  ',
  phoneNumber: '0491570006',
};

const args = (answers: OnboardingAnswers) => {
  const result = toProfileArgs(answers, { currentYear: 2026 });
  if (!result.ok) throw new Error(`expected ok, got ${result.error.message}`);
  return result.data;
};

const failure = (answers: OnboardingAnswers) => {
  const result = toProfileArgs(answers, { currentYear: 2026 });
  if (result.ok) throw new Error('expected a failure');
  return result.error;
};

describe('toProfileArgs: a patient', () => {
  it('maps the answers to create_profile arguments', () => {
    expect(args(patient)).toEqual({
      p_name: 'Sam',
      p_user_type: 'patient',
      p_sex: 'Female',
      p_year_of_birth: 1980,
      p_conditions: ['Arthritis', 'Gout'],
      p_other_conditions: 'stiff in the morning',
      p_phone: '+61491570006',
    });
  });

  it.each([
    ['female', 'Female'],
    ['male', 'Male'],
    ['prefer not to say', 'Prefer not to say'],
  ] as const)('maps sex %s to %s', (sex, expected) => {
    expect(args({ ...patient, sex }).p_sex).toBe(expected);
  });

  it('turns a blank other conditions answer into null', () => {
    expect(args({ ...patient, otherConditions: '   ' }).p_other_conditions).toBeNull();
  });

  it('drops blank and repeated conditions', () => {
    expect(
      args({ ...patient, conditions: ['Gout', '  ', 'Gout', 'Arthritis'] }).p_conditions,
    ).toEqual(['Gout', 'Arthritis']);
  });

  it('sends no conditions when the user has no diagnosis', () => {
    expect(args({ ...patient, hasDiagnosis: false }).p_conditions).toEqual([]);
  });

  it('keeps a missing year of birth as null', () => {
    expect(args({ ...patient, yearOfBirth: null }).p_year_of_birth).toBeNull();
  });

  it('normalises a spaced local phone number to E.164', () => {
    expect(args({ ...patient, phoneNumber: '0491 570 006' }).p_phone).toBe('+61491570006');
  });
});

describe('toProfileArgs: a support person', () => {
  const supportPerson: OnboardingAnswers = {
    ...patient,
    userType: 'support-person',
    sex: null,
    yearOfBirth: null,
    hasDiagnosis: null,
    conditions: [],
    otherConditions: '',
  };

  it('sends the name and phone only, as support_person', () => {
    expect(args(supportPerson)).toEqual({
      p_name: 'Sam',
      p_user_type: 'support_person',
      p_sex: null,
      p_year_of_birth: null,
      p_conditions: [],
      p_other_conditions: null,
      p_phone: '+61491570006',
    });
  });

  it('ignores any sex, year or conditions that were entered', () => {
    const result = args({ ...patient, userType: 'support-person' });
    expect(result.p_sex).toBeNull();
    expect(result.p_year_of_birth).toBeNull();
    expect(result.p_conditions).toEqual([]);
  });
});

describe('toProfileArgs: the first problem is reported with its field', () => {
  it.each([
    ['a blank name', { name: '   ' }, 'name'],
    ['a name over 45 characters', { name: 'a'.repeat(46) }, 'name'],
    ['no user type', { userType: null }, 'userType'],
    ['an invalid phone number', { phoneNumber: '0312345678' }, 'phoneNumber'],
    ['no sex for a patient', { sex: null }, 'sex'],
    ['a year before 1900', { yearOfBirth: 1899 }, 'yearOfBirth'],
    ['a year in the future', { yearOfBirth: 2027 }, 'yearOfBirth'],
    ['a condition over 45 characters', { conditions: ['a'.repeat(46)] }, 'conditions'],
  ] as const)('%s', (_label, change, field) => {
    const error = failure({ ...patient, ...change } as OnboardingAnswers);
    expect(error.code).toBe('VALIDATION');
    expect(error.field).toBe(field);
  });

  it('reports the name before the phone number when both are wrong', () => {
    expect(failure({ ...patient, name: '', phoneNumber: '1' }).field).toBe('name');
  });
});
