import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import {
  getAppointmentDateText,
  getAppointmentTitle,
  getAppointmentViewLabel,
} from '@/features/care-planner/appointmentDisplay';
import type { AppointmentsState } from '@/features/care-planner/useAppointments';

import { AppointmentRow } from './AppointmentRow';

type MyAppointmentsSectionProps = {
  state: AppointmentsState;
  onViewAppointment: (appointmentId: number) => void;
  onPrepare: () => void;
  onRetry: () => void;
};

const PREPARE_LABEL = 'Prepare for my appointment';

/**
 * The "My Appointments" card: the list (or an empty message, loading or error state) and the
 * "Prepare for my appointment" button, which is always shown.
 */
export function MyAppointmentsSection({
  state,
  onViewAppointment,
  onPrepare,
  onRetry,
}: MyAppointmentsSectionProps) {
  const prepareButton = <Button label={PREPARE_LABEL} onPress={onPrepare} />;

  return (
    <Card variant="muted" style={styles.section}>
      <Text accessibilityRole="header" style={styles.heading}>
        My Appointments
      </Text>

      {state.status === 'loading' ? (
        <>
          <LoadingState label="Loading appointments" />
          <View style={styles.action}>{prepareButton}</View>
        </>
      ) : null}

      {state.status === 'error' ? (
        <>
          <Card>
            <ErrorState message="We could not load your appointments." onRetry={onRetry} />
          </Card>
          <View style={styles.action}>{prepareButton}</View>
        </>
      ) : null}

      {state.status === 'ready' && state.appointments.length === 0 ? (
        <Card style={styles.emptyCard}>
          <EmptyState message="You have not planned any appointments.">{prepareButton}</EmptyState>
        </Card>
      ) : null}

      {state.status === 'ready' && state.appointments.length > 0 ? (
        <>
          <View style={styles.list}>
            {state.appointments.map((appointment) => (
              <AppointmentRow
                key={appointment.appointmentId}
                title={getAppointmentTitle(appointment)}
                dateText={getAppointmentDateText(appointment)}
                viewAccessibilityLabel={getAppointmentViewLabel(appointment)}
                onView={() => onViewAppointment(appointment.appointmentId)}
              />
            ))}
          </View>
          <View style={styles.action}>{prepareButton}</View>
        </>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  section: {
    marginHorizontal: Spacing.five,
    padding: Spacing.three,
    gap: Spacing.three,
  },
  heading: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: Colors.light.onSurface,
  },
  list: {
    gap: Spacing.three,
  },
  emptyCard: {
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  action: {
    alignItems: 'center',
  },
});
