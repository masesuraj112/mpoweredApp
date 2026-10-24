import { NotificationBell } from '@/components/mpowered/support-person/NotificationBell';
import { PillButton } from '@/components/mpowered/support-person/PillButton';
import { SupportedPatientCard } from '@/components/mpowered/support-person/SupportedPatientCard';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSupportPerson } from '@/features/support-person/context';
import { getGreeting } from '@/features/support-person/greeting';
import type { Appointment, SupportedPatient } from '@/features/support-person/types';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Care Planner home for support persons (Figma 3911-24607, empty state 3896-21458). */
export default function CarePlannerHomeScreen() {
  const { status, reload, patients, requests } = useSupportPerson();
  // Saved at sign-up. Empty only when browsing with BYPASS_AUTH and no account; the greeting then leaves the name out.
  const name = useAuth().profile?.name ?? '';

  const openRequests = () => router.push('/care-planner/requests');
  const openAppointments = (patient: SupportedPatient) =>
    router.push({ pathname: '/care-planner/[patientId]', params: { patientId: patient.id } });
  const openAddQuestions = (patient: SupportedPatient, appointment: Appointment) =>
    router.push({
      pathname: '/care-planner/appointment-action',
      params: { action: 'add-questions', patientId: patient.id, appointmentId: String(appointment.appointmentId) },
    });

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    gap: scaleHeight(12),
    paddingTop: scaleHeight(24),
    paddingBottom: scaleHeight(32),
    paddingHorizontal: scaleWidth(24),
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: scaleWidth(10),
    paddingRight: scaleWidth(6),
  },
  greeting: {
    color: Colors.light.text,
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  title: {
    marginTop: scaleHeight(6),
    paddingHorizontal: scaleWidth(9),
    color: Colors.light.text,
    fontSize: scaleFont(20),
    fontWeight: '700',
    lineHeight: scaleFont(24),
  },
  body: {
    paddingHorizontal: scaleWidth(9),
    color: Colors.light.text,
    fontSize: scaleFont(14),
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodyEmphasis: {
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  sectionTitle: {
    marginTop: scaleHeight(18),
    paddingHorizontal: scaleWidth(11),
    color: Colors.light.text,
    fontSize: scaleFont(16),
    fontWeight: '700',
    lineHeight: scaleFont(22),
  },
  cards: {
    gap: scaleHeight(18),
    marginTop: scaleHeight(8),
  },
  emptyButton: {
    marginTop: scaleHeight(18),
    paddingHorizontal: scaleWidth(14),
  },
});
