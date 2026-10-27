// Pure helpers for dictation: which language to listen for, and what to tell the person when
// something goes wrong. Pure module: no imports from @/lib/supabase, react-native or expo-*.

export type DictationIssue =
  | 'permission-denied'
  | 'permission-blocked'
  | 'on-device-unavailable'
  | 'language-unavailable'
  | 'no-speech'
  | 'network'
  | 'busy'
  | 'unknown';

/** Fallback when nothing better is known. */
export const DEFAULT_DICTATION_LOCALE = 'en-AU';

const sameLanguage = (a: string, b: string) =>
  a.split(/[-_]/)[0].toLowerCase() === b.split(/[-_]/)[0].toLowerCase();

const normaliseTag = (tag: string) => tag.replace('_', '-');

/**
 * The language to recognise: the device's locale if it is supported, else en-AU when the device
 * language is English and en-AU is supported, else another locale in the device's language, else
 * the first supported locale. Returns the default when the supported list is empty or unknown.
 */
export function pickRecognitionLocale(
  deviceLocale: string | null | undefined,
  supported: readonly string[],
): string {
  const device = deviceLocale ? normaliseTag(deviceLocale) : DEFAULT_DICTATION_LOCALE;
  if (supported.length === 0) return device;

  const options = supported.map(normaliseTag);
  const exact = options.find((tag) => tag.toLowerCase() === device.toLowerCase());
  if (exact) return exact;

  if (sameLanguage(device, 'en')) {
    const au = options.find((tag) => tag.toLowerCase() === DEFAULT_DICTATION_LOCALE.toLowerCase());
    if (au) return au;
  }
  const sameLang = options.find((tag) => sameLanguage(tag, device));
  return sameLang ?? options[0];
}

/** Maps an engine error code to an issue. Returns null for errors that need no message. */
export function issueFromErrorCode(code: string): DictationIssue | null {
  switch (code) {
    case 'aborted':
      return null;
    case 'not-allowed':
    case 'service-not-allowed':
      return 'permission-denied';
    case 'no-speech':
    case 'speech-timeout':
      return 'no-speech';
    case 'network':
      return 'network';
    case 'busy':
      return 'busy';
    case 'language-not-supported':
      return 'language-unavailable';
    default:
      return 'unknown';
  }
}

/** Short, plain-language text for an issue. Typing always still works. */
export function getDictationMessage(issue: DictationIssue): string {
  switch (issue) {
    case 'permission-denied':
      return 'Dictation needs permission to use the microphone and speech recognition. Tap the microphone to try again, or keep typing.';
    case 'permission-blocked':
      return 'Dictation is turned off for this app. You can turn it on in your phone’s settings, or keep typing.';
    case 'on-device-unavailable':
      return 'Dictation needs speech recognition that runs on this phone, which isn’t supported here. You can keep typing.';
    case 'language-unavailable':
      return 'Dictation isn’t available for this language on this phone. You can keep typing.';
    case 'no-speech':
      return 'No speech was heard. Tap the microphone and try again.';
    case 'network':
      return 'Dictation couldn’t finish. Please try again, or keep typing.';
    case 'busy':
      return 'Dictation is busy. Please try again in a moment.';
    case 'unknown':
      return 'Dictation stopped unexpectedly. You can keep typing.';
  }
}

/** Shown when the speech package is not part of this build (for example in Expo Go). */
export const DICTATION_NOT_IN_BUILD_MESSAGE = 'Dictation isn’t available in this build.';
