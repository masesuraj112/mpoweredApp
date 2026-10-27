import {
  describeAccess,
  describeContact,
  EMPTY_SUPPORT_PERSON_DRAFT,
  hasErrors,
  isDraftEmpty,
  NAME_REQUIRED_MESSAGE,
  toSupportPerson,
  validateField,
  validateSupportPerson,
  type SupportPersonDraft,
} from './supportPerson';

const draft = (overrides: Partial<SupportPersonDraft> = {}): SupportPersonDraft => ({
  ...EMPTY_SUPPORT_PERSON_DRAFT,
  ...overrides,
});

describe('isDraftEmpty', () => {
  it('is true for nothing, and for whitespace only', () => {
    expect(isDraftEmpty(draft())).toBe(true);
    expect(isDraftEmpty(draft({ name: '   ', phone: ' ', email: '\t' }))).toBe(true);
  });

  it('is false when anything is typed or ticked', () => {
    expect(isDraftEmpty(draft({ name: 'Bron' }))).toBe(false);
    expect(isDraftEmpty(draft({ canAddQuestions: true }))).toBe(false);
  });
});

describe('validateSupportPerson', () => {
  it('requires a name', () => {
    expect(validateSupportPerson(draft({ phone: '0400 000 000' })).name).toBe(NAME_REQUIRED_MESSAGE);
    expect(validateSupportPerson(draft({ name: '   ' })).name).toBe(NAME_REQUIRED_MESSAGE);
  });

  it('accepts a name alone: phone and email are both optional', () => {
    expect(hasErrors(validateSupportPerson(draft({ name: 'Bron' })))).toBe(false);
  });

  it('rejects a bad phone number only when one is entered', () => {
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '12345' })).phone).toMatch(/phone/i);
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '' })).phone).toBeUndefined();
  });

  it('accepts an Australian number with spaces', () => {
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '0400 000 000' })).phone).toBeUndefined();
  });

  it('rejects a bad email only when one is entered', () => {
    expect(validateSupportPerson(draft({ name: 'Bron', email: 'not-an-email' })).email).toMatch(
      /email/i,
    );
    expect(validateSupportPerson(draft({ name: 'Bron', email: '' })).email).toBeUndefined();
  });

  it('reports every problem at once', () => {
    const errors = validateSupportPerson(draft({ phone: 'abc', email: 'x' }));
    expect(errors.name && errors.phone && errors.email).toBeTruthy();
  });
});

describe('validateField', () => {
  it('stays quiet about the name on an untouched form', () => {
    expect(validateField('name', draft())).toBeUndefined();
  });

  it('asks for the name once something else has been entered', () => {
    expect(validateField('name', draft({ phone: '0400 000 000' }))).toBe(NAME_REQUIRED_MESSAGE);
  });

  it('checks the phone and email on their own', () => {
    expect(validateField('phone', draft({ name: 'Bron', phone: '1' }))).toMatch(/phone/i);
    expect(validateField('email', draft({ name: 'Bron', email: 'a@b' }))).toMatch(/email/i);
  });
});

describe('toSupportPerson', () => {
  it('trims, removes phone separators and turns empty into null', () => {
    expect(
      toSupportPerson(draft({ name: '  Bron  ', phone: ' 0400 000-000 ', email: '   ' })),
    ).toEqual({
      name: 'Bron',
      phone: '0400000000',
      email: null,
      canAddQuestions: false,
      canAddAnswers: false,
    });
  });

  it('keeps the access flags and a trimmed email', () => {
    expect(
      toSupportPerson(draft({ name: 'Bron', email: ' bron@example.com ', canAddAnswers: true })),
    ).toEqual({
      name: 'Bron',
      phone: null,
      email: 'bron@example.com',
      canAddQuestions: false,
      canAddAnswers: true,
    });
  });
});

describe('describeContact and describeAccess', () => {
  it('joins the details that exist', () => {
    expect(
      describeContact({
        name: 'B',
        phone: '0400000000',
        email: 'b@example.com',
        canAddQuestions: false,
        canAddAnswers: false,
      }),
    ).toBe('0400000000 · b@example.com');
    expect(
      describeContact({ name: 'B', phone: null, email: null, canAddQuestions: false, canAddAnswers: false }),
    ).toBe('');
  });

  it('lists the access chosen', () => {
    const base = { name: 'B', phone: null, email: null };
    expect(describeAccess({ ...base, canAddQuestions: true, canAddAnswers: true })).toBe(
      'Add questions, Add doctor’s answer',
    );
    expect(describeAccess({ ...base, canAddQuestions: false, canAddAnswers: false })).toBe(
      'No access chosen',
    );
  });
});
