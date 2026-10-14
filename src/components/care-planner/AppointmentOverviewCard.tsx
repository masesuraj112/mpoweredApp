import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { Colors, Spacing, Typography } from '@/constants/theme';

type AppointmentOverviewCardProps = {
  dateText: string;
  doctorName: string;
  healthService: string;
  supportPerson: string;
};

export function AppointmentOverviewCard({
  dateText,
  doctorName,
  healthService,
  supportPerson,
}: AppointmentOverviewCardProps) {
  return (
    <Card variant="muted" style={styles.card}>
      <OverviewRow label="Appointment date" value={dateText} />
      <OverviewRow label="Doctor’s name" value={doctorName} />
      <OverviewRow label="Health services" value={healthService} />
      <OverviewRow label="Support Person" value={supportPerson} />
    </Card>
  );
}

function OverviewRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  row: {
    gap: Spacing.half,
  },
  label: {
    ...Typography.labelLarge,
    color: Colors.light.onSurfaceVariant,
  },
  value: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
    color: Colors.light.onSurface,
  },
});
