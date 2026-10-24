import {
  DEFAULT_DICTATION_LOCALE,
  getDictationMessage,
  issueFromErrorCode,
  pickRecognitionLocale,
} from './dictation';

describe('pickRecognitionLocale', () => {
  const supported = ['en-US', 'en-AU', 'fr-FR'];

  it('uses the device locale when it is supported', () => {
    expect(pickRecognitionLocale('fr-FR', supported)).toBe('fr-FR');
    expect(pickRecognitionLocale('en-US', supported)).toBe('en-US');
  });

  it('prefers en-AU for another English locale', () => {
    expect(pickRecognitionLocale('en-GB', supported)).toBe('en-AU');
  });

  it('falls back to another locale in the same language', () => {
    expect(pickRecognitionLocale('fr-CA', ['en-AU', 'fr-FR'])).toBe('fr-FR');
  });

  it('falls back to the first supported locale', () => {
    expect(pickRecognitionLocale('de-DE', ['en-US', 'fr-FR'])).toBe('en-US');
  });

  it('accepts underscore tags', () => {
    expect(pickRecognitionLocale('en_AU', ['en-AU'])).toBe('en-AU');
  });

  it('returns the device locale, or en-AU, when the supported list is unknown', () => {
    expect(pickRecognitionLocale('es-ES', [])).toBe('es-ES');
    expect(pickRecognitionLocale(null, [])).toBe(DEFAULT_DICTATION_LOCALE);
  });
});

describe('issueFromErrorCode', () => {
  it('ignores a deliberate abort', () => {
    expect(issueFromErrorCode('aborted')).toBeNull();
  });

  it('maps known codes', () => {
    expect(issueFromErrorCode('not-allowed')).toBe('permission-denied');
    expect(issueFromErrorCode('no-speech')).toBe('no-speech');
    expect(issueFromErrorCode('speech-timeout')).toBe('no-speech');
    expect(issueFromErrorCode('network')).toBe('network');
    expect(issueFromErrorCode('busy')).toBe('busy');
    expect(issueFromErrorCode('language-not-supported')).toBe('language-unavailable');
  });

  it('maps anything else to unknown', () => {
    expect(issueFromErrorCode('client')).toBe('unknown');
  });
});

describe('getDictationMessage', () => {
  it('always tells the person typing still works or what to do next', () => {
    expect(getDictationMessage('permission-blocked')).toMatch(/settings/i);
    expect(getDictationMessage('on-device-unavailable')).toMatch(/typing/i);
    expect(getDictationMessage('no-speech')).toMatch(/try again/i);
  });
});
