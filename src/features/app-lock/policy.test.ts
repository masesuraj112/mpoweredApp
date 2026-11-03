import { LOCK_AFTER_MS, shouldLockOnReturn, unlockFailureMessage, unlockMethodName } from './policy';

describe('shouldLockOnReturn', () => {
  it('locks after five minutes or more away, not after a quick switch', () => {
    const now = 1_000_000;
    expect(shouldLockOnReturn(now - LOCK_AFTER_MS, now)).toBe(true);
    expect(shouldLockOnReturn(now - LOCK_AFTER_MS + 1, now)).toBe(false);
  });

  it('does not lock when the app never went to the background', () => {
    expect(shouldLockOnReturn(null, 1_000_000)).toBe(false);
  });
});

describe('unlockMethodName', () => {
  it('uses each phone’s own name for it', () => {
    expect(unlockMethodName('face', 'ios')).toBe('Face ID');
    expect(unlockMethodName('face', 'android')).toBe('face unlock');
    expect(unlockMethodName('fingerprint', 'ios')).toBe('Touch ID');
    expect(unlockMethodName('fingerprint', 'android')).toBe('fingerprint');
    expect(unlockMethodName('passcode', 'ios')).toBe('your passcode');
    expect(unlockMethodName('passcode', 'android')).toBe('your screen lock');
  });
});

describe('unlockFailureMessage', () => {
  it('says nothing when the person cancelled', () => {
    expect(unlockFailureMessage('user_cancel')).toBeNull();
    expect(unlockFailureMessage('system_cancel')).toBeNull();
  });

  it('explains a lockout and a phone with nothing set up', () => {
    expect(unlockFailureMessage('lockout')).toMatch(/Too many tries/);
    expect(unlockFailureMessage('passcode_not_set')).toMatch(/set up/);
  });

  it('asks to try again otherwise', () => {
    expect(unlockFailureMessage('authentication_failed')).toMatch(/try again/);
  });
});
