import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppointmentCard } from '@/components/support-person/AppointmentCard';
import { InitialsAvatar } from '@/components/support-person/InitialsAvatar';
import { PermissionChips } from '@/components/support-person/PermissionChips';
import { SectionLabel } from '@/components/support-person/SectionLabel';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Spacing } from '@/constants/theme';
import { splitAppointments } from '@/features/support-person/appointments';
import { useSupportPerson } from '@/features/support-person/context';
import { openAppointmentAction } from '@/features/support-person/navigation';
import { APPOINTMENT_ACTION_LABELS, getAppointmentActions } from '@/features/support-person/permissions';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';

/** One patient's upcoming and past appointments, as seen by their support person (Figma 3911-25095, 3911-24852). */
export default function PatientAppointmentsScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { status, reload, getPatient } = useSupportPerson();
  const patient = getPatient(patientId);

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        header: () => (
          <ScreenHeader title={patient ? `${patient.name}’s Appointments` : 'Appointments'} onBack={() => router.back()} />
        ),
      }}
    />
  );

  if (status !== 'ready') {
    return (
      <Screen edges={[]}>
        {header}
        {status === 'loading' ? (
          <LoadingState label="Loading appointments" />
        ) : (
          <ErrorState message="We could not load this person's appointments." onRetry={reload} />
        )}
      </Screen>
    );
  }

  // e.g. the support person unpaired from this patient in Settings, or followed an old link.
  if (!patient) {
    return (
      <Screen edges={[]}>
        {header}
        <AppText variant="bodyMediumRegular" color="onSurfaceVariant">
          You no longer support this person.
        </AppText>
      </Screen>
    );
  }

  const { upcoming, past } = splitAppointments(patient.appointments);
  // They only see appointments the patient added them to (decision S2), so say so when there are none.
  const noneShared = patient.appointments.length === 0;
  const firstName = patient.name.split(' ')[0];

  return (
    <Screen edges={[]}>
      {header}
      <View style={styles.content}>
        <View style={styles.patientRow}>
          <InitialsAvatar name={patient.name} size={49} />
          <View style={styles.patientText}>
            <AppText accessibilityRole="header" variant="headlineSmall" numberOfLines={1}>
              {patient.name}
            </AppText>
            {patient.condition ? (
              <AppText variant="labelLargeBold" color="textTertiary" numberOfLines={1}>
                {patient.condition}
              </AppText>
            ) : null}
          </View>
        </View>

        <PermissionChips canAddQuestions={patient.canAddQuestions} canAddAnswers={patient.canAddAnswers} />

        <AppointmentSection
          title="Upcoming appointments"
          emptyText={noneShared ? `${firstName} hasn’t added you to an appointment yet.` : 'No upcoming appointments.'}
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
      </View>
    </Screen>
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
        <AppText variant="bodyMediumRegular" color="onSurfaceVariant">
          {emptyText}
        </AppText>
      ) : (
        appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.appointmentId}
            appointment={appointment}
            actions={actionTypes.map((action) => ({
              label: APPOINTMENT_ACTION_LABELS[action],
              onPress: () => openAppointmentAction(action, patient.id, appointment.appointmentId),
            }))}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.three,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.mid,
  },
  patientText: {
    flex: 1,
  },
  section: {
    gap: Spacing.two,
  },
});
