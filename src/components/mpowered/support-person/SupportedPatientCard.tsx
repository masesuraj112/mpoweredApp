import { Colors } from '@/constants/theme';
import { getNextAppointment } from '@/features/support-person/appointments';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { StyleSheet, Text, View } from 'react-native';

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
          <Text style={styles.name} numberOfLines={1}>
            {patient.name}
          </Text>
          <Text style={styles.condition} numberOfLines={1}>
            {patient.condition}
          </Text>
        </View>
        <StatusBadge hasUpcoming={!!next} />
      </View>

      <View style={styles.divider} />
      <PermissionChips canAddQuestions={patient.canAddQuestions} canAddAnswers={patient.canAddAnswers} />

      {next && (
        <>
          <View style={styles.divider} />
          <View style={styles.section}>
            <SectionLabel>Upcoming appointment</SectionLabel>
            <AppointmentCard
              appointment={next}
              actions={patient.canAddQuestions ? [{ label: 'Add questions', onPress: () => onAddQuestions(next) }] : []}
            />
          </View>
        </>
      )}

      <View style={styles.divider} />
      <PillButton size="large" label="View more appointments" onPress={onViewAppointments} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: scaleHeight(9),
    paddingTop: scaleHeight(17),
    paddingBottom: scaleHeight(15),
    paddingHorizontal: scaleWidth(14),
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: scaleWidth(20),
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(14),
  },
  headerText: {
    flex: 1,
    gap: scaleHeight(2),
  },
  name: {
    color: Colors.light.onSurface,
    fontSize: scaleFont(15),
    fontWeight: '700',
    lineHeight: 20,
  },
  condition: {
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: scaleFont(12),
    lineHeight: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F2F2F7',
  },
  section: {
    gap: scaleHeight(7),
  },
});
