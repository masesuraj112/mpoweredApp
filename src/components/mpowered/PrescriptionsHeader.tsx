import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { makeStyles, Spacing, Typography } from '@/constants/theme';
interface PrescriptionsHeaderProps {
  title: string;
  /** Optional label shown on the right of the top bar, e.g. "Homescreen" */
  topBarLabel?: string;
  /** Optional content rendered to the right of the title, e.g. action chips */
  titleAccessory?: ReactNode;
}


export function PrescriptionsHeader({ title, topBarLabel, titleAccessory }: PrescriptionsHeaderProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  return (
    <View>
      {/* The bar's colour runs up behind the status bar to the top of the screen. */}
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
        {/* Back always returns to the start of My Health, however deep in the stack we are */}
        <Pressable
          style={styles.backRow}
          hitSlop={8}
          onPress={() => router.dismissTo('/health')}
          accessibilityRole="button"
          accessibilityLabel="Back to My Health"
        >
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>Back to My Health</Text>
        </Pressable>
        {topBarLabel && <Text style={styles.topBarLabel}>{topBarLabel}</Text>}
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>{title}</Text>
        {titleAccessory}
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  topBar: {
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarLabel: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  backChevron: {
    ...Typography.title,
    color: colors.textSecondary,
    marginRight: Spacing.half,
    marginTop: -Spacing.half,
  },
  backText: {
    ...Typography.bodyLarge,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.three,
    marginHorizontal: Spacing.four,
  },
  title: {
    flexShrink: 1,
    ...Typography.display,
    color: colors.text,
  },
}));
