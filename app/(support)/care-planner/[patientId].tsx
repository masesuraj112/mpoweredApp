import { BackHeader } from '@/components/mpowered/BackHeader';
import { AppointmentCard } from '@/components/mpowered/support-person/AppointmentCard';
import { InitialsAvatar } from '@/components/mpowered/support-person/InitialsAvatar';
import { PermissionChips } from '@/components/mpowered/support-person/PermissionChips';
import { SectionLabel } from '@/components/mpowered/support-person/SectionLabel';
import { Colors } from '@/constants/theme';
import { splitAppointments } from '@/features/support-person/appointments';
import { useSupportPerson } from '@/features/support-person/context';
import { APPOINTMENT_ACTION_LABELS, getAppointmentActions } from '@/features/support-person/permissions';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

/** One patient's upcoming and past appointments, as seen by their support person (Figma 3911-25095, 3911-24852). */
export default function PatientAppointmentsScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { getPatient } = useSupportPerson();
  const patient = getPatient(patientId);

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        header: () => (
          <BackHeader title={patient ? `${patient.name}’s Appointments` : 'Appointments'} onBack={() => router.back()} />
        ),
      }}
    />
  );

  // e.g. the support person unpaired from this patient in Settings, or followed an old link.
  if (!patient) {
    return (
      <View style={styles.screen}>
        {header}
        <Text style={[styles.empty, styles.notFound]}>You no longer support this person.</Text>
      </View>
    );
  }

  const { upcoming, past } = splitAppointments(patient.appointments);

  return (
    <View style={styles.screen}>
      {header}
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.patientRow}>
          <InitialsAvatar name={patient.name} size={49} />
          <View style={styles.patientText}>
            <Text style={styles.name} numberOfLines={1}>
              {patient.name}
            </Text>
            <Text style={styles.condition} numberOfLines={1}>
              {patient.condition}
            </Text>
          </View>
        </View>

        <PermissionChips canAddQuestions={patient.canAddQuestions} canAddAnswers={patient.canAddAnswers} />

        <AppointmentSection
          title="Upcoming appointments"
          emptyText="No upcoming appointments."
          appointments={upcoming}
          patient={patient}
          isUpcoming
        />
        <AppointmentSection
          title="Past appointments"
          emptyText="No past appointments."
          appointments={past}
          patient={patient}
          isUpcoming={false}
        />
      </ScrollView>
    </View>
  );
}

type AppointmentSectionProps = {
  title: string;
  emptyText: string;
  appointments: Appointment[];
  patient: SupportedPatient;
  isUpcoming: boolean;
};

function AppointmentSection({ title, emptyText, appointments, patient, isUpcoming }: AppointmentSectionProps) {
  const actionTypes = getAppointmentActions(patient, isUpcoming);

  return (
    <View style={styles.section}>
      <SectionLabel>{title}</SectionLabel>
      {appointments.length === 0 ? (
        <Text style={styles.empty}>{emptyText}</Text>
      ) : (
        appointments.map(appointment => (
          <AppointmentCard
            key={appointment.appointmentId}
            appointment={appointment}
            actions={actionTypes.map(action => ({
              label: APPOINTMENT_ACTION_LABELS[action],
              onPress: () =>
                router.push({
                  pathname: '/care-planner/appointment-action',
                  params: { action, patientId: patient.id, appointmentId: String(appointment.appointmentId) },
                }),
            }))}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    gap: scaleHeight(20),
    paddingTop: scaleHeight(32),
    paddingBottom: scaleHeight(32),
    paddingHorizontal: scaleWidth(25),
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(10),
  },
  patientText: {
    flex: 1,
  },
  name: {
    color: Colors.light.text,
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleFont(29),
    letterSpacing: -0.48,
  },
  condition: {
    marginLeft: scaleWidth(4),
    color: 'rgba(60, 60, 67, 0.6)',
    fontSize: scaleFont(14),
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  section: {
    gap: scaleHeight(7),
  },
  empty: {
    color: Colors.light.onSurfaceVariant,
    fontSize: scaleFont(14),
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  notFound: {
    padding: scaleWidth(25),
  },
});
