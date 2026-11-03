import type { ReactNode } from 'react';
import { ScrollView, Text, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContentColumn, makeStyles, Spacing, Typography } from '@/constants/theme';

type PlannerFlowScreenProps = {
  title: string;
  /** `bold` is the default; the review screen's title is regular weight in the design. */
  titleWeight?: 'bold' | 'regular';
  /** The scrolling content, shown under the title. */
  children: ReactNode;
  /** Shown below the scrolling content (an action bar), never over it. */
  footer?: ReactNode;
  scrollEnabled?: boolean;
  keyboardShouldPersistTaps?: ScrollViewProps['keyboardShouldPersistTaps'];
};

/**
 * The layout shared by the planner flow screens: safe area, a Back button, a scrolling body with
 * the screen title, and an optional footer. The Back button returns to the previous screen.
 */
export function PlannerFlowScreen({
  title,
  titleWeight = 'bold',
  children,
  footer,
  scrollEnabled,
  keyboardShouldPersistTaps,
}: PlannerFlowScreenProps) {
  const styles = useStyles();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>

      <ScrollView
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={styles.content}>
        <Text
          accessibilityRole="header"
          style={[styles.title, titleWeight === 'bold' && styles.titleBold]}>
          {title}
        </Text>
        {children}
      </ScrollView>

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
    ...ContentColumn,
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    ...Typography.display,
    color: colors.text,
  },
  // Headings are already Sulphur Point Bold; a fontWeight on a custom font can lose the face on iOS.
  titleBold: {
    color: colors.text,
  },
}));
