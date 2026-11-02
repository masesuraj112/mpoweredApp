import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { makeStyles, Spacing, Typography } from '@/constants/theme';

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
  const styles = useStyles();
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
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  row: {
    gap: Spacing.half,
  },
  label: {
    ...Typography.labelLarge,
    color: colors.onSurfaceVariant,
  },
  value: {
    ...Typography.bodySmall,
    letterSpacing: 0.25,
    color: colors.onSurface,
  },
}));
