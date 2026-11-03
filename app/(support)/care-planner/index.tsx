import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { NotificationBell } from '@/components/support-person/NotificationBell';
import { PillButton } from '@/components/support-person/PillButton';
import { SupportedPatientCard } from '@/components/support-person/SupportedPatientCard';
import { AppText } from '@/components/ui/AppText';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Screen } from '@/components/ui/Screen';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSupportPerson } from '@/features/support-person/context';
import { getGreeting } from '@/features/support-person/greeting';
import { openAppointmentAction } from '@/features/support-person/navigation';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';

/** Care Planner home for support persons (Figma 3911-24607, empty state 3896-21458). */
export default function CarePlannerHomeScreen() {
  const { status, reload, patients, requests } = useSupportPerson();
  // Saved at sign-up. Empty only when browsing with BYPASS_AUTH and no account; the greeting then leaves the name out.
  const name = useAuth().profile?.name ?? '';

  const openRequests = () => router.push('/care-planner/requests');
  const openAppointments = (patient: SupportedPatient) =>
    router.push({ pathname: '/care-planner/[patientId]', params: { patientId: patient.id } });
  const openAddQuestions = (patient: SupportedPatient, appointment: Appointment) =>
    openAppointmentAction('add-questions', patient.id, appointment.appointmentId);

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.greetingRow}>
          <AppText variant="bodyMedium">{getGreeting(name)}</AppText>
          <NotificationBell count={requests.length} onPress={openRequests} />
        </View>

        <AppText accessibilityRole="header" variant="titleLarge">
          Your support makes a difference
        </AppText>
        <AppText variant="bodyMediumRegular">
          Help prepare for upcoming appointments by reviewing and adding questions for the doctor
        </AppText>

        {status === 'loading' ? (
          <LoadingState label="Loading the people you support" />
        ) : status === 'error' ? (
          <ErrorState message="We could not load the people you support." onRetry={reload} />
        ) : patients.length > 0 ? (
          <>
            <AppText accessibilityRole="header" variant="titleMedium" style={styles.sectionTitle}>
              People you support
            </AppText>
            <View style={styles.cards}>
              {patients.map((patient) => (
                <SupportedPatientCard
                  key={patient.id}
                  patient={patient}
                  onAddQuestions={(appointment) => openAddQuestions(patient, appointment)}
                  onViewAppointments={() => openAppointments(patient)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <AppText accessibilityRole="header" variant="titleMedium" style={styles.sectionTitle}>
              People you support (0 people)
            </AppText>
            <AppText variant="bodyMediumRegular">
              You haven’t accepted any support person requests yet. Requests can be sent by a patient through your phone
              number.
            </AppText>
            <View>
              <AppText variant="labelLargeBold">Haven’t received a request?</AppText>
              <AppText variant="bodyMediumRegular">
                Check to make sure your phone number was entered correctly by the patient.
              </AppText>
            </View>
            <View style={styles.emptyButton}>
              <PillButton size="large" label="Check support person requests" onPress={openRequests} />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.mid,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    marginTop: Spacing.three,
  },
  cards: {
    gap: Spacing.three,
  },
  emptyButton: {
    marginTop: Spacing.three,
  },
});
