import {
  describeAccess,
  describeContact,
  EMPTY_SUPPORT_PERSON_DRAFT,
  hasErrors,
  availableSupportPeople,
  canAddAnotherPerson,
  isDraftEmpty,
  MAX_SUPPORT_PEOPLE,
  MOBILE_REQUIRED_MESSAGE,
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
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '12345' })).phone).toBe(
      MOBILE_REQUIRED_MESSAGE,
    );
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '' })).phone).toBeUndefined();
  });

  it('accepts an Australian mobile with spaces or in +61 form', () => {
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '0400 000 000' })).phone).toBeUndefined();
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '+61 400 000 000' })).phone).toBeUndefined();
  });

  it('rejects a landline: only mobiles can sign in', () => {
    expect(validateSupportPerson(draft({ name: 'Bron', phone: '02 9999 9999' })).phone).toBe(
      MOBILE_REQUIRED_MESSAGE,
    );
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
    expect(validateField('phone', draft({ name: 'Bron', phone: '1' }))).toBe(MOBILE_REQUIRED_MESSAGE);
    expect(validateField('email', draft({ name: 'Bron', email: 'a@b' }))).toMatch(/email/i);
  });
});

describe('toSupportPerson', () => {
  it('trims, sends the phone as E.164 and turns empty into null', () => {
    expect(
      toSupportPerson(draft({ name: '  Bron  ', phone: ' 0400 000-000 ', email: '   ' })),
    ).toEqual({
      name: 'Bron',
      phone: '+61400000000',
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

describe('toSupportPerson: blank phone', () => {
  it('stays null', () => {
    expect(toSupportPerson(draft({ name: 'Bron', phone: '   ' })).phone).toBeNull();
  });
});

describe('describeContact and describeAccess', () => {
  it('joins the details that exist, showing the phone in local format', () => {
    expect(
      describeContact({
        name: 'B',
        phone: '+61400000000',
        email: 'b@example.com',
        canAddQuestions: false,
        canAddAnswers: false,
      }),
    ).toBe('0400 000 000 · b@example.com');
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

describe('phone display round-trip', () => {
  it('shows what was typed (in local format) after being stored as E.164', () => {
    const person = toSupportPerson(draft({ name: 'Bron', phone: '0400 000 000' }));
    expect(describeContact(person)).toBe('0400 000 000');
  });
});

describe('canAddAnotherPerson', () => {
  it('allows up to two support people', () => {
    expect(MAX_SUPPORT_PEOPLE).toBe(2);
    expect(canAddAnotherPerson(0)).toBe(true);
    expect(canAddAnotherPerson(1)).toBe(true);
    expect(canAddAnotherPerson(2)).toBe(false);
  });
});

describe('availableSupportPeople', () => {
  const person = (id: number | undefined, name: string) => ({
    supportPersonId: id,
    name,
    phone: null,
    email: null,
    canAddQuestions: false,
    canAddAnswers: false,
  });

  it('offers the saved people who are not on the appointment yet', () => {
    const saved = [person(1, 'Bron'), person(2, 'Sam'), person(3, 'Alex')];
    expect(availableSupportPeople(saved, [person(2, 'Sam')]).map((p) => p.name)).toEqual([
      'Bron',
      'Alex',
    ]);
  });

  it('offers everyone when nobody is chosen, and nobody when all are', () => {
    const saved = [person(1, 'Bron'), person(2, 'Sam')];
    expect(availableSupportPeople(saved, [])).toHaveLength(2);
    expect(availableSupportPeople(saved, saved)).toEqual([]);
  });

  it('does not offer a person who has no id, and ignores chosen people without one', () => {
    const saved = [person(undefined, 'Unsaved'), person(1, 'Bron')];
    expect(availableSupportPeople(saved, [person(undefined, 'Typed in')]).map((p) => p.name)).toEqual([
      'Bron',
    ]);
  });
});
