import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';

type AppointmentRowProps = {
  title: string;
  /** For example "Date: 10 June 2026". Hidden when empty. */
  dateText: string;
  /** Spoken label for the View button. */
  viewAccessibilityLabel: string;
  onView: () => void;
};

export function AppointmentRow({ title, dateText, viewAccessibilityLabel, onView }: AppointmentRowProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.details}>
        <Text style={styles.title}>{title}</Text>
        {dateText ? <Text style={styles.date}>{dateText}</Text> : null}
      </View>
      <Button
        label="View"
        trailingGlyph="→"
        variant="tonal"
        accessibilityLabel={viewAccessibilityLabel}
        onPress={onView}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  details: {
    flex: 1,
    gap: Spacing.half,
  },
  title: {
    ...Typography.labelLarge,
    color: Colors.light.onSurface,
  },
  date: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
});
