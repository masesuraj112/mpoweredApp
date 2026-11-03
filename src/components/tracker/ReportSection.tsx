import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';

/** A titled block inside a summary report, such as "My results:" or "My reflections:". */
export function ReportSection({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText accessibilityRole="header" variant="labelMedium" color="onSurface">
        {heading}
      </AppText>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: Spacing.four,
    gap: Spacing.mid,
  },
  body: {
    gap: Spacing.mid,
    paddingHorizontal: Spacing.mid,
  },
});
