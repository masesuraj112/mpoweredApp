import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Whether the app lock is on. Saved on this device, and turned off when the person signs out, so someone who
 * cannot unlock can sign out and sign back in with their SMS code.
 */
const APP_LOCK_KEY = '@mpowered/app-lock';

export async function isAppLockOn(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(APP_LOCK_KEY)) === 'on';
  } catch {
    return false;
  }
}

export async function saveAppLock(on: boolean): Promise<void> {
  if (on) await AsyncStorage.setItem(APP_LOCK_KEY, 'on');
  else await AsyncStorage.removeItem(APP_LOCK_KEY);
}
