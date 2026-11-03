import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Spacing } from '@/constants/theme';

type PrescriptionsHeaderProps = {
  title: string;
  /** Optional label shown on the right of the top bar, for example "Homescreen". */
  topBarLabel?: string;
  /** Optional content rendered to the right of the title, for example action chips. */
  titleAccessory?: ReactNode;
};

/** The My Health sub-page header: Back to My Health, then the page title with optional actions. */
export function PrescriptionsHeader({ title, topBarLabel, titleAccessory }: PrescriptionsHeaderProps) {
  return (
    <ScreenHeader
      backLabel="Back to My Health"
      title={topBarLabel}
      padForStatusBar={false}
      // Back always returns to the start of My Health, however deep in the stack we are.
      onBack={() => router.dismissTo('/health')}>
      <View style={styles.titleRow}>
        <AppText accessibilityRole="header" variant="titleLarge" style={styles.title}>
          {title}
        </AppText>
        {titleAccessory}
      </View>
    </ScreenHeader>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.three,
    marginHorizontal: Spacing.four,
  },
  title: {
    flexShrink: 1,
  },
});
