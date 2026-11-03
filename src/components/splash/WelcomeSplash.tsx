import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SplashColors, Spacing, Typography } from '@/constants/theme';

const wordmark = require('@/assets/images/splash/wordmark.svg');
const waves = require('@/assets/images/splash/waves.svg');

// The two SVGs' own sizes (Figma 2003:378 and 2003:380), so they keep their shape at any width.
const WORDMARK_ASPECT = 1530.38 / 231;
const WAVES_ASPECT = 3042 / 2531.78;

export type WelcomeGreeting = 'Welcome to' | 'Welcome back to';

/**
 * The welcome splash (Figma 2003:362 "Welcome to", 2004:393 "Welcome back to"): the greeting and the
 * MPowered wordmark a third of the way down, decorative waves across the lower half, and who it is
 * powered by at the bottom. Shown while the app starts (docs/backend/app-icons-and-splash-plan.md).
 */
export function WelcomeSplash({ greeting }: { greeting: WelcomeGreeting }) {
  return (
    <LinearGradient colors={[SplashColors.gradientTop, SplashColors.gradientBottom]} style={styles.screen}>
      <StatusBar style="light" />
      {/* A background drawing pinned where the design puts it; it bleeds off the sides and bottom. */}
      <View
        style={styles.wavesLayer}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Image source={waves} style={styles.waves} contentFit="contain" accessible={false} />
      </View>

      <SafeAreaView style={styles.content} edges={['top', 'bottom']}>
        <View style={styles.above} />
        {/* Read as one heading, "Welcome to MPowered": the wordmark is a picture of the name. */}
        <View style={styles.title} accessible accessibilityRole="header" accessibilityLabel={`${greeting} MPowered`}>
          <Text style={styles.greeting}>{greeting}</Text>
          <Image source={wordmark} style={styles.wordmark} contentFit="contain" />
        </View>
        <View style={styles.below} />
        <Text style={styles.footer}>
          Powered by{'\n'}Musculoskeletal Health Australia
        </Text>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SplashColors.gradientBottom,
    overflow: 'hidden',
  },
  // In the design the waves start 48% down, 4% left of the screen, 142% of its width, tilted 1°.
  wavesLayer: {
    ...StyleSheet.absoluteFill,
  },
  waves: {
    position: 'absolute',
    top: '48%',
    left: '-4%',
    width: '142%',
    aspectRatio: WAVES_ASPECT,
    transform: [{ rotate: '1deg' }],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  // The title sits about a third of the way down: 3 parts above it to 5 below.
  above: { flex: 3 },
  below: { flex: 5 },
  title: {
    alignItems: 'center',
    gap: Spacing.three,
    width: '100%',
  },
  greeting: {
    color: SplashColors.text,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '500',
    textAlign: 'center',
  },
  wordmark: {
    width: '71%',
    aspectRatio: WORDMARK_ASPECT,
  },
  footer: {
    ...Typography.labelLarge,
    color: SplashColors.text,
    textAlign: 'center',
    marginBottom: Spacing.five,
  },
});
