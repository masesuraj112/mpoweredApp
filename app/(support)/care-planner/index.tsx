import { NotificationBell } from '@/components/support-person/NotificationBell';
import { PillButton } from '@/components/support-person/PillButton';
import { SupportedPatientCard } from '@/components/support-person/SupportedPatientCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { BrandScreen, HeroGreeting, HeroLead, HeroTitle } from '@/components/ui/BrandScreen';
import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSupportPerson } from '@/features/support-person/context';
import { getGreeting } from '@/features/support-person/greeting';
import { openAppointmentAction } from '@/features/support-person/navigation';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

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
    <BrandScreen
      hero={
        <>
          <View style={styles.greetingRow}>
            <HeroGreeting>{getGreeting(name)}</HeroGreeting>
            <NotificationBell count={requests.length} onPress={openRequests} tone="onBrand" />
          </View>
          <HeroTitle>Your support makes a difference</HeroTitle>
          <HeroLead>Help prepare for upcoming appointments by reviewing and adding questions for the doctor</HeroLead>
        </>
      }>
      {status === 'loading' ? (
        <LoadingState label="Loading the people you support" />
      ) : status === 'error' ? (
        <ErrorState message="We could not load the people you support." onRetry={reload} />
      ) : patients.length > 0 ? (
        <>
          <Text style={styles.sectionHeading} accessibilityRole="header">
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
          <Text style={styles.sectionHeading} accessibilityRole="header">
            People you support (0 people)
          </Text>
          <View style={styles.emptyCard}>
            <Text style={styles.body}>
              You haven’t accepted any support person requests yet. Requests can be sent by a patient through your
              phone number.
            </Text>
            <View>
              <Text style={[styles.body, styles.bodyEmphasis]}>Haven’t received a request?</Text>
              <Text style={styles.body}>Check to make sure your phone number was entered correctly by the patient.</Text>
            </View>
            <PillButton size="large" label="Check support person requests" onPress={openRequests} />
          </View>
        </>
      )}
    </BrandScreen>
  );
}

// The same hero and section styles as the Pain Tracker home.
const useStyles = makeStyles((colors) => ({
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  sectionHeading: {
    marginBottom: Spacing.three,
    color: colors.text,
    ...Typography.titleSmall,
  },
  cards: {
    gap: Spacing.three,
  },
  emptyCard: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  body: {
    color: colors.text,
    ...Typography.bodyLarge,
  },
  bodyEmphasis: {
    fontWeight: '600',
  },
}));
