import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

import { unlockFailureMessage, unlockMethodName, type UnlockMethod } from './policy';

/** Whether the phone can check it is its owner: biometrics, or at least a passcode. */
export async function canCheckOwner(): Promise<boolean> {
  try {
    const level = await LocalAuthentication.getEnrolledLevelAsync();
    return level !== LocalAuthentication.SecurityLevel.NONE;
  } catch {
    return false;
  }
}

/** The best way this phone can unlock the app, for the Settings label and the lock screen. */
export async function getUnlockMethod(): Promise<UnlockMethod> {
  try {
    if (!(await LocalAuthentication.isEnrolledAsync())) return 'passcode';
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) return 'face';
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) return 'fingerprint';
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) return 'iris';
    return 'passcode';
  } catch {
    return 'passcode';
  }
}

export function methodName(method: UnlockMethod): string {
  return unlockMethodName(method, Platform.OS === 'ios' ? 'ios' : 'android');
}

/**
 * Asks the phone to check it is its owner, falling back to the phone's passcode when biometrics fail or
 * are not set up. `message` is null when the person cancelled, so there is nothing to say.
 */
export async function checkOwner(promptMessage: string): Promise<{ ok: true } | { ok: false; message: string | null }> {
  try {
    const result = await LocalAuthentication.authenticateAsync({ promptMessage, cancelLabel: 'Cancel' });
    if (result.success) return { ok: true };
    return { ok: false, message: unlockFailureMessage(result.error) };
  } catch {
    return { ok: false, message: unlockFailureMessage('unknown') };
  }
}
