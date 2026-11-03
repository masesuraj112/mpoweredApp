import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { makeStyles, MaxContentWidth, Spacing } from '@/constants/theme';

type ScreenProps = {
  children: ReactNode;
  /** Scroll the content (default). Pass `false` when the content manages its own scrolling. */
  scroll?: boolean;
  /**
   * Which edges the safe area pads. Default is the top only. Pass `[]` under a navigation header or a
   * tab bar, which already sit inside the safe area.
   */
  edges?: readonly Edge[];
  /** Shown below the content (an action bar), never over it. */
  footer?: ReactNode;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
  keyboardDismissMode?: ScrollViewProps['keyboardDismissMode'];
};

/**
 * The page layout every screen shares: a safe-area container on the page background, with padded
 * content that scrolls and stops growing wider than `MaxContentWidth` on tablets.
 */
export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  footer,
  keyboardShouldPersistTaps,
  keyboardDismissMode,
}: ScreenProps) {
  const styles = useStyles();
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keyboardDismissMode={keyboardDismissMode}
          // Starts below a native header on iOS, which is see-through, and ends above the tab bar.
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[styles.content, styles.scrollContent]}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill]}>{children}</View>
      )}
      {footer}
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  scrollContent: {
    flexGrow: 1,
  },
  fill: {
    flex: 1,
  },
}));
