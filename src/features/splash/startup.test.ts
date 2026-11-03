import { showWelcomeBack, type WelcomeBackInput } from './startup';

const signedInStart: WelcomeBackInput = { startedSignedIn: true, hasProfile: null, profileError: null, minimumElapsed: false };

describe('showWelcomeBack', () => {
  it('shows while a returning user’s profile loads', () => {
    expect(showWelcomeBack(signedInStart)).toBe(true);
    expect(showWelcomeBack({ ...signedInStart, minimumElapsed: true })).toBe(true);
  });

  it('keeps showing until the minimum time has passed, then stops', () => {
    expect(showWelcomeBack({ ...signedInStart, hasProfile: true })).toBe(true);
    expect(showWelcomeBack({ ...signedInStart, hasProfile: true, minimumElapsed: true })).toBe(false);
  });

  it('never shows for someone signing in now, or before the session is read', () => {
    expect(showWelcomeBack({ ...signedInStart, startedSignedIn: false })).toBe(false);
    expect(showWelcomeBack({ ...signedInStart, startedSignedIn: null })).toBe(false);
  });

  it('stops at once for a profile error, so the error screen shows', () => {
    expect(showWelcomeBack({ ...signedInStart, profileError: { code: 'NETWORK' } })).toBe(false);
  });

  it('stops at once with no profile yet, so onboarding can start', () => {
    expect(showWelcomeBack({ ...signedInStart, hasProfile: false })).toBe(false);
  });
});
