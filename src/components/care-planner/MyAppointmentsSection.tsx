import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing, Typography } from '@/constants/theme';
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
  /** Opens the screen for planning a new appointment. */
  onAdd: () => void;
  onRetry: () => void;
};

const PREPARE_LABEL = 'Prepare for my appointment';
const ADD_LABEL = 'Add appointment';

/**
 * The "My Appointments" card: the list (or an empty message, loading or error state) and the
 * "Prepare for my appointment" button, which is always shown.
 */
export function MyAppointmentsSection({
  state,
  onViewAppointment,
  onPrepare,
  onAdd,
  onRetry,
}: MyAppointmentsSectionProps) {
  const prepareButton = <Button label={PREPARE_LABEL} onPress={onPrepare} />;
  const addButtonProminent = (
    <Button label={ADD_LABEL} variant="primary" onPress={onAdd} style={styles.prominentAdd} />
  );

  return (
    <Card variant="muted" style={styles.section}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={styles.heading}>
          My Appointments
        </Text>
        <Button label={ADD_LABEL} leadingGlyph="+" variant="tonal" onPress={onAdd} />
      </View>

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
          <EmptyState message="You have not planned any appointments.">
            {addButtonProminent}
            {prepareButton}
          </EmptyState>
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
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  prominentAdd: {
    minWidth: 200,
  },
  heading: {
    ...Typography.labelLargeBold,
    flexShrink: 1,
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
