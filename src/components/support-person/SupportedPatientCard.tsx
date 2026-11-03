import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Divider } from '@/components/ui/Divider';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { getNextAppointment } from '@/features/support-person/appointments';
import { APPOINTMENT_ACTION_LABELS } from '@/features/support-person/permissions';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';

import { AppointmentCard } from './AppointmentCard';
import { InitialsAvatar } from './InitialsAvatar';
import { PermissionChips } from './PermissionChips';
import { PillButton } from './PillButton';
import { SectionLabel } from './SectionLabel';
import { StatusBadge } from './StatusBadge';

type SupportedPatientCardProps = {
  patient: SupportedPatient;
  onAddQuestions: (appointment: Appointment) => void;
  onViewAppointments: () => void;
};

/**
 * One person the support person supports, on the Care Planner home (Figma 3911-25050, 3911-25060):
 * who they are, the support person's permissions, their next appointment, and a link to the rest.
 */
export function SupportedPatientCard({ patient, onAddQuestions, onViewAppointments }: SupportedPatientCardProps) {
  const next = getNextAppointment(patient.appointments);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <InitialsAvatar name={patient.name} />
        <View style={styles.headerText}>
          <AppText variant="titleMedium" color="onSurface" numberOfLines={1}>
            {patient.name}
          </AppText>
          {/* Hidden when the patient has no conditions recorded. */}
          {patient.condition ? (
            <AppText variant="bodySmall" color="textTertiary" numberOfLines={1}>
              {patient.condition}
            </AppText>
          ) : null}
        </View>
        <StatusBadge hasUpcoming={!!next} />
      </View>

      <Divider />
      <PermissionChips canAddQuestions={patient.canAddQuestions} canAddAnswers={patient.canAddAnswers} />

      {next && (
        <>
          <Divider />
          <View style={styles.section}>
            <SectionLabel>Upcoming appointment</SectionLabel>
            <AppointmentCard
              appointment={next}
              actions={
                patient.canAddQuestions
                  ? [{ label: APPOINTMENT_ACTION_LABELS['add-questions'], onPress: () => onAddQuestions(next) }]
                  : []
              }
            />
          </View>
        </>
      )}

      <Divider />
      <PillButton size="large" label="View more appointments" onPress={onViewAppointments} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.mid,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.mid,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radius.extraLarge,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.mid,
  },
  headerText: {
    flex: 1,
    gap: Spacing.half,
  },
  section: {
    gap: Spacing.two,
  },
});
