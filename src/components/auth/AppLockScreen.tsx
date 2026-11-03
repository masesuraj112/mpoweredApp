import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MinTapTarget, Radius, SplashColors, Spacing, Typography, Colors } from '@/constants/theme';
import { useAppLock } from '@/features/app-lock/AppLockContext';

const wordmark = require('@/assets/images/splash/wordmark.svg');
const WORDMARK_ASPECT = 1530.38 / 231;

/**
 * Covers the app while the app lock is on and the person has not unlocked it yet. It asks the phone to
 * check it is its owner as soon as it shows; Unlock asks again, and Sign out is the way out for someone
 * who cannot unlock (they sign back in with their SMS code). On the brand gradient in light and dark mode.
 */
export function AppLockScreen({ onSignOut }: { onSignOut: () => void }) {
  const { unlock, methodName } = useAppLock();
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const askedOnShow = useRef(false);

  const tryUnlock = async () => {
    if (checking) return;
    setChecking(true);
    setMessage(null);
    setMessage(await unlock());
    setChecking(false);
  };

  useEffect(() => {
    if (askedOnShow.current) return;
    askedOnShow.current = true;
    void tryUnlock();
    // Only once, as the lock appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LinearGradient colors={[SplashColors.gradientTop, SplashColors.gradientBottom]} style={styles.screen}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        <View style={styles.middle}>
          <Image source={wordmark} style={styles.wordmark} contentFit="contain" accessibilityLabel="MPowered" />
          <Text accessibilityRole="header" style={styles.title}>
            MPowered is locked
          </Text>
          <Text style={styles.lead}>Unlock with {methodName} to carry on.</Text>
          {message ? (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            onPress={tryUnlock}
            disabled={checking}
            accessibilityRole="button"
            accessibilityLabel="Unlock"
            accessibilityState={{ disabled: checking, busy: checking }}
            style={({ pressed }) => [styles.unlock, pressed && styles.pressed]}>
            <Text style={styles.unlockText}>Unlock</Text>
          </Pressable>
          <Pressable
            onPress={onSignOut}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
            hitSlop={Spacing.two}
            style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}>
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Fixed colours, not the theme: the lock sits on the brand gradient in both modes, like the splash.
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SplashColors.gradientBottom,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  wordmark: {
    width: '70%',
    maxWidth: 320,
    aspectRatio: WORDMARK_ASPECT,
    marginBottom: Spacing.four,
  },
  title: {
    ...Typography.titleSmall,
    color: Colors.light.onBrand,
    textAlign: 'center',
  },
  lead: {
    ...Typography.bodyLarge,
    color: Colors.light.onBrandMuted,
    textAlign: 'center',
  },
  message: {
    ...Typography.bodySmall,
    color: Colors.light.onBrand,
    textAlign: 'center',
  },
  actions: {
    alignItems: 'center',
    gap: Spacing.three,
    paddingBottom: Spacing.four,
  },
  unlock: {
    minHeight: MinTapTarget,
    minWidth: 200,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.onBrand,
  },
  unlockText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: SplashColors.gradientTop,
  },
  signOut: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  signOutText: {
    ...Typography.bodyLarge,
    color: Colors.light.onBrand,
    textDecorationLine: 'underline',
  },
  pressed: {
    opacity: 0.8,
  },
});
