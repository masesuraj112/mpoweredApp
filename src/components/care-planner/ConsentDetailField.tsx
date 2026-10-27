import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

type ConsentDetailFieldProps = {
  label: string;
  value: string;
};

/** A labelled, read-only value (appointment date, doctor, health service). */
export function ConsentDetailField({ label, value }: ConsentDetailFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueBox}>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.light.onSurface,
  },
  valueBox: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.control - 2,
    backgroundColor: Colors.light.background,
  },
  value: {
    ...Typography.bodyLarge,
    color: Colors.light.onSurface,
  },
});
