import { Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';

/** One labelled answer in a summary: what was asked, then what the person said. */
export function ResultSection({ heading, value }: { heading: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  section: {
    gap: Spacing.half,
  },
  heading: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  value: {
    ...Typography.bodyLarge,
    color: colors.text,
  },
}));
