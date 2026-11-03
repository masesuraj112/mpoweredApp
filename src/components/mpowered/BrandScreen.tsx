import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ContentColumn, Gradients, Spacing, makeStyles } from '@/constants/theme';

type BrandScreenProps = {
  /** What sits on the brand gradient at the top: a greeting, the page title and a line or two. */
  hero: ReactNode;
  /** The rest of the page, under the gradient. */
  children: ReactNode;
};

/**
 * A tab's home page: the brand gradient from the top of the screen to both edges, then the page's content
 * in a centred column. Used by the Pain Tracker home and the support person's Care Planner home, so the
 * two look the same.
 */
export function BrandScreen({ hero, children }: BrandScreenProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();

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
        <LinearGradient
          colors={Gradients.brand}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + Spacing.four }]}>
          <View style={styles.column}>{hero}</View>
        </LinearGradient>
        <View style={[styles.column, styles.body]}>{children}</View>
      </ScrollView>
      {/* The status bar always sits on the gradient's colour, however iOS insets the scroll view. */}
      <View style={[styles.statusBarFill, { height: insets.top }]} />
    </SafeAreaView>
  );
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
  body: {
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  statusBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Gradients.brand[0],
  },
}));
