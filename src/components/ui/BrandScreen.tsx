import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandText } from '@/components/brand/BrandText';
import { ContentColumn, Gradients, Spacing, Typography, makeStyles } from '@/constants/theme';

type BrandScreenProps = {
  /** What sits on the brand gradient at the top: a greeting, the page title and a line or two. */
  hero: ReactNode;
  /** The rest of the page, under the gradient. */
  children: ReactNode;
  /** Set false when the sections below pad themselves (they use the same gutter). */
  padBody?: boolean;
};

/**
 * A tab's home page: the brand gradient from the top of the screen to both edges, then the page's content
 * in a centred column. Used by the Pain Tracker home and the support person's Care Planner home, so the
 * two look the same.
 */
export function BrandScreen({ hero, children, padBody = true }: BrandScreenProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const heroRef = useRef<ComponentRef<typeof View>>(null);
  // How far down the screen the gradient starts. iOS usually moves a tab's scroll view below the status
  // bar itself, Android doesn't; measuring means the greeting is padded only for what it still sits under.
  const [heroTop, setHeroTop] = useState(Platform.OS === 'ios' ? insets.top : 0);
  const coveredByStatusBar = Math.max(0, insets.top - heroTop);
  const measureHero = () => heroRef.current?.measureInWindow((_x: number, y: number) => setHeroTop(Math.max(0, y)));

  // White status bar text over the gradient while this screen shows; the app's default everywhere else.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('auto');
    }, []),
  );

  return (
    // The gradient runs under the status bar, so only the bottom edge is kept clear here.
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}>
        {/* Pulling down past the top shows the gradient's own colour, not the page, above it. */}
        <View style={styles.overscroll} />
        {/* Top to bottom, so its whole top edge is the status bar strip's colour and the two join. */}
        <View ref={heroRef} onLayout={measureHero}>
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.hero, { paddingTop: coveredByStatusBar + Spacing.three }]}>
            <View style={[styles.column, styles.heroColumn]}>{hero}</View>
          </LinearGradient>
        </View>
        <View style={[styles.column, styles.body, padBody && styles.bodyGutter]}>{children}</View>
      </ScrollView>
      {/* The status bar always sits on the gradient's colour, however iOS insets the scroll view. */}
      <View style={[styles.statusBarFill, { height: insets.top }]} />
    </SafeAreaView>
  );
}

/** The small line above the title, for example "Good morning, Alex". */
export function HeroGreeting({ children }: { children: ReactNode }) {
  const styles = useStyles();
  return <Text style={styles.greeting}>{children}</Text>;
}

/** The page's title on the gradient. "MPowered" in it is drawn as the wordmark. */
export function HeroTitle({ children }: { children: string }) {
  const styles = useStyles();
  return (
    <BrandText accessibilityRole="header" style={styles.title}>
      {children}
    </BrandText>
  );
}

/** A line or two under the title. "MPowered" in it is drawn as the wordmark. */
export function HeroLead({ children }: { children: string }) {
  const styles = useStyles();
  return <BrandText style={styles.lead}>{children}</BrandText>;
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.three,
  },
  overscroll: {
    position: 'absolute',
    top: -1000,
    left: 0,
    right: 0,
    height: 1000,
    backgroundColor: Gradients.brand[0],
  },
  hero: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.four,
  },
  column: {
    ...ContentColumn,
  },
  heroColumn: {
    gap: Spacing.two,
  },
  body: {
    paddingTop: Spacing.four,
  },
  bodyGutter: {
    paddingHorizontal: Spacing.five,
  },
  greeting: {
    color: colors.onBrandMuted,
    ...Typography.titleSmall,
  },
  title: {
    color: colors.onBrand,
    ...Typography.display,
  },
  lead: {
    color: colors.onBrandMuted,
    ...Typography.bodyLarge,
  },
  statusBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Gradients.brand[0],
  },
}));
