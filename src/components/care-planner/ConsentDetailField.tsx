import { Text, View } from 'react-native';

import { Radius, Spacing, Typography, makeStyles } from '@/constants/theme';

type ConsentDetailFieldProps = {
  label: string;
  value: string;
};

/** A labelled, read-only value (appointment date, doctor, health service). */
export function ConsentDetailField({ label, value }: ConsentDetailFieldProps) {
  const styles = useStyles();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueBox}>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  field: {
    gap: Spacing.two,
  },
  label: {
    ...Typography.labelLarge,
    color: colors.onSurface,
  },
  valueBox: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.control - 2,
    backgroundColor: colors.background,
  },
  value: {
    ...Typography.bodyLarge,
    color: colors.onSurface,
  },
}));
