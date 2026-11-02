import { NotificationBell } from '@/components/mpowered/support-person/NotificationBell';
import { PillButton } from '@/components/mpowered/support-person/PillButton';
import { SupportedPatientCard } from '@/components/mpowered/support-person/SupportedPatientCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { ContentColumn, makeStyles, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSupportPerson } from '@/features/support-person/context';
import { getGreeting } from '@/features/support-person/greeting';
import { openAppointmentAction } from '@/features/support-person/navigation';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Care Planner home for support persons (Figma 3911-24607, empty state 3896-21458). */
export default function CarePlannerHomeScreen() {
  const styles = useStyles();
  const { status, reload, patients, requests } = useSupportPerson();
  // Saved at sign-up. Empty only when browsing with BYPASS_AUTH and no account; the greeting then leaves the name out.
  const name = useAuth().profile?.name ?? '';

  const openRequests = () => router.push('/care-planner/requests');
  const openAppointments = (patient: SupportedPatient) =>
    router.push({ pathname: '/care-planner/[patientId]', params: { patientId: patient.id } });
  const openAddQuestions = (patient: SupportedPatient, appointment: Appointment) =>
    openAppointmentAction('add-questions', patient.id, appointment.appointmentId);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>{getGreeting(name)}</Text>
          <NotificationBell count={requests.length} onPress={openRequests} />
        </View>

        <Text style={styles.title} accessibilityRole="header">
          Your support makes a difference
        </Text>
        <Text style={styles.body}>Help prepare for upcoming appointments by reviewing and adding questions for the doctor</Text>

        {status === 'loading' ? (
          <LoadingState label="Loading the people you support" />
        ) : status === 'error' ? (
          <ErrorState message="We could not load the people you support." onRetry={reload} />
        ) : patients.length > 0 ? (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              People you support
            </Text>
            <View style={styles.cards}>
              {patients.map(patient => (
                <SupportedPatientCard
                  key={patient.id}
                  patient={patient}
                  onAddQuestions={appointment => openAddQuestions(patient, appointment)}
                  onViewAppointments={() => openAppointments(patient)}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              People you support (0 people)
            </Text>
            <Text style={styles.body}>
              You haven’t accepted any support person requests yet. Requests can be sent by a patient through your phone
              number.
            </Text>
            <View>
              <Text style={[styles.body, styles.bodyEmphasis]}>Haven’t received a request?</Text>
              <Text style={styles.body}>Check to make sure your phone number was entered correctly by the patient.</Text>
            </View>
            <View style={styles.emptyButton}>
              <PillButton size="large" label="Check support person requests" onPress={openRequests} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    ...ContentColumn,
    gap: Spacing.two,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    paddingHorizontal: Spacing.four,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: Spacing.two,
    paddingRight: Spacing.two,
  },
  greeting: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
  title: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.two,
    color: colors.text,
    ...Typography.titleSmall,
  },
  body: {
    paddingHorizontal: Spacing.two,
    color: colors.text,
    ...Typography.bodySmall,
    letterSpacing: 0.25,
  },
  bodyEmphasis: {
    color: colors.text,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  sectionTitle: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.two,
    color: colors.text,
    ...Typography.bodyLarge,
    fontWeight: '700',
  },
  cards: {
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  emptyButton: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
}));
