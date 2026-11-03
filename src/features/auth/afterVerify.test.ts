import { nextStepAfterVerify, type AfterVerifyInput, type NextStep } from './afterVerify';

// Every row of the table in docs/backend/sign-up-sign-in-plan.md, section 4.2.
const cases: [AfterVerifyInput, NextStep][] = [
  [{ intent: 'sign-up', hasProfile: false, answersComplete: true }, 'create-profile'],
  [{ intent: 'sign-up', hasProfile: true, answersComplete: true }, 'account-exists'],
  [{ intent: 'sign-up', hasProfile: true, answersComplete: false }, 'account-exists'],
  [{ intent: 'sign-in', hasProfile: true, answersComplete: false }, 'home'],
  [{ intent: 'sign-in', hasProfile: true, answersComplete: true }, 'home'],
  [{ intent: 'sign-in', hasProfile: false, answersComplete: false }, 'no-account'],
  [{ intent: 'sign-in', hasProfile: false, answersComplete: true }, 'no-account'],
  [{ intent: null, hasProfile: true, answersComplete: false }, 'home'],
  [{ intent: null, hasProfile: false, answersComplete: true }, 'create-profile'],
  [{ intent: null, hasProfile: false, answersComplete: false }, 'sign-up-questions'],
];

describe('nextStepAfterVerify', () => {
  it.each(cases)('%j → %s', (input, expected) => {
    expect(nextStepAfterVerify(input)).toBe(expected);
  });

  it('asks the sign-up questions if a sign-up somehow reaches the code without them', () => {
    expect(nextStepAfterVerify({ intent: 'sign-up', hasProfile: false, answersComplete: false })).toBe(
      'sign-up-questions',
    );
  });

  it('never creates a profile over an existing account', () => {
    for (const intent of ['sign-up', 'sign-in', null] as const) {
      for (const answersComplete of [true, false]) {
        expect(nextStepAfterVerify({ intent, hasProfile: true, answersComplete })).not.toBe('create-profile');
      }
    }
  });
});
