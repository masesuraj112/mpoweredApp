import type { ReactNode } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { useAppLock } from '@/features/app-lock/AppLockContext';
import { signOut } from '@/services/auth';

import { AppLockScreen } from './AppLockScreen';

/**
 * Puts the lock screen over the app while it is locked, and hides the app underneath from screen readers.
 * `waiting` holds the lock screen back while something else covers the app (the welcome back splash).
 */
export function AppLockGate({ waiting, children }: { waiting: boolean; children: ReactNode }) {
  const { locked } = useAppLock();

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.ok) Alert.alert('Sign out failed', result.error.message);
  };

  return (
    <View style={styles.root}>
      <View
        style={styles.root}
        accessibilityElementsHidden={locked}
        importantForAccessibility={locked ? 'no-hide-descendants' : 'auto'}>
        {children}
      </View>
      {locked && !waiting && (
        <View style={StyleSheet.absoluteFill} accessibilityViewIsModal>
          <AppLockScreen onSignOut={handleSignOut} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
