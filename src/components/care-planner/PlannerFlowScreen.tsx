import type { ReactNode } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentColumn, makeStyles, Spacing } from '@/constants/theme';
import { ScreenTitle } from '@/components/ui/nativeHeader';

type PlannerFlowScreenProps = {
  title: string;
  /** The scrolling content, shown under the title. */
  children: ReactNode;
  /** Shown below the scrolling content (an action bar), never over it. */
  footer?: ReactNode;
  scrollEnabled?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
};

/**
 * The layout shared by the planner flow screens: the title in the native header (whose back button
 * returns to the previous screen), a scrolling body and an optional footer.
 */
export function PlannerFlowScreen({
  title,
  children,
  footer,
  scrollEnabled,
  keyboardShouldPersistTaps,
}: PlannerFlowScreenProps) {
  const styles = useStyles();

  return (
    // The scroll view is the screen's first view, so the large title in the header follows it (iOS).
    <>
      <ScreenTitle title={title} />
      <ScrollView
        style={styles.safeArea}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}>
        {children}
      </ScrollView>

      {footer ? (
        <SafeAreaView style={styles.footer} edges={['bottom']}>
          {footer}
        </SafeAreaView>
      ) : null}
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  footer: {
    backgroundColor: colors.background,
  },
  content: {
    ...ContentColumn,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
}));
