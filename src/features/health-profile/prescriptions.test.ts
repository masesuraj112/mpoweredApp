import {
  formatFrequency,
  formatPrescriptionName,
  prescriptionErrorMessage,
  toPrescriptionForm,
  validatePrescription,
  type Prescription,
  type PrescriptionForm,
} from './prescriptions';

const form: PrescriptionForm = {
  name: ' Perindopril arginine ',
  strength: '5',
  strengthUnit: 'mg',
  form: 'tablets',
  amount: '1',
  repeatsEvery: '1',
  unitOfTime: 'days',
};

const prescription: Prescription = {
  id: 3,
  name: 'Perindopril arginine',
  strength: 5,
  strengthUnit: 'mg',
  form: 'tablets',
  amount: 1,
  repeatsEvery: 1,
  unitOfTime: 'days',
};

describe('validatePrescription', () => {
  it('accepts a complete form, trims the name and turns text into numbers', () => {
    expect(validatePrescription(form)).toEqual({
      ok: true,
      data: {
        name: 'Perindopril arginine',
        strength: 5,
        strengthUnit: 'mg',
        form: 'tablets',
        amount: 1,
        repeatsEvery: 1,
        unitOfTime: 'days',
      },
    });
  });

  it('accepts decimal strengths and amounts, including a comma as the separator', () => {
    const result = validatePrescription({ ...form, strength: '0.5', amount: '2,5' });
    expect(result).toMatchObject({ ok: true, data: { strength: 0.5, amount: 2.5 } });
  });

  it.each([
    ['name', { name: '   ' }],
    ['name', { name: 'x'.repeat(101) }],
    ['strength', { strength: '' }],
    ['strength', { strength: '0' }],
    ['strength', { strength: '-1' }],
    ['strength', { strength: 'five' }],
    ['amount', { amount: '' }],
    ['repeatsEvery', { repeatsEvery: '1.5' }],
    ['repeatsEvery', { repeatsEvery: '0' }],
    ['strengthUnit', { strengthUnit: 'kg' }],
    ['form', { form: 'pills' }],
    ['unitOfTime', { unitOfTime: 'years' }],
  ])('rejects a bad %s', (field, patch) => {
    const result = validatePrescription({ ...form, ...(patch as Partial<PrescriptionForm>) });
    expect(result).toMatchObject({ ok: false, error: { code: 'VALIDATION', field } });
  });
});

describe('display text', () => {
  it('names the medication with its strength', () => {
    expect(formatPrescriptionName(prescription)).toBe('Perindopril arginine 5 mg');
    expect(formatPrescriptionName({ ...prescription, strength: 1, strengthUnit: '%' })).toBe(
      'Perindopril arginine 1%',
    );
  });

  it('uses singular words for one and plural words otherwise', () => {
    expect(formatFrequency(prescription)).toBe('1 tablet every day');
    expect(
      formatFrequency({ ...prescription, amount: 2, form: 'capsules', repeatsEvery: 8, unitOfTime: 'hours' }),
    ).toBe('2 capsules every 8 hours');
  });

  it('round-trips a saved prescription into the edit form', () => {
    expect(validatePrescription(toPrescriptionForm(prescription))).toMatchObject({
      ok: true,
      data: { name: 'Perindopril arginine', strength: 5, amount: 1 },
    });
  });
});

describe('prescriptionErrorMessage', () => {
  it('shows the app validation message but never raw database text', () => {
    expect(prescriptionErrorMessage({ code: 'VALIDATION', message: 'Enter a name.', field: 'name' })).toBe(
      'Enter a name.',
    );
    expect(
      prescriptionErrorMessage({ code: 'VALIDATION', message: 'violates check constraint chk_x' }),
    ).not.toContain('chk_x');
  });

  it('explains a prescription that no longer exists', () => {
    expect(prescriptionErrorMessage({ code: 'NOT_FOUND', message: '' })).toMatch(/no longer exists/);
  });
});
