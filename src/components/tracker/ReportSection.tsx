import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';

/** A titled block inside a summary report, such as "My results:" or "My reflections:". */
export function ReportSection({ heading, children }: { heading: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.heading}>
        {heading}
      </Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    gap: Spacing.two,
  },
  heading: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  body: {
    gap: Spacing.three,
  },
}));
