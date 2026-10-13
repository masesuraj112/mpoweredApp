import { AppointmentCard } from '@/components/mpowered/support-person/AppointmentCard';
import { InitialsAvatar } from '@/components/mpowered/support-person/InitialsAvatar';
import { NotificationBell } from '@/components/mpowered/support-person/NotificationBell';
import { PermissionChips } from '@/components/mpowered/support-person/PermissionChips';
import { PillButton } from '@/components/mpowered/support-person/PillButton';
import { SectionLabel } from '@/components/mpowered/support-person/SectionLabel';
import { StatusBadge } from '@/components/mpowered/support-person/StatusBadge';
import { getNextAppointment, splitAppointments } from '@/features/support-person/appointments';
import { useSupportPerson } from '@/features/support-person/context';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// TEMPORARY preview of the step 3 components. Step 4 of docs/support-person-frontend.md replaces this
// with the real Care Planner home.
export default function CarePlannerHomeScreen() {
  const { patients, requests } = useSupportPerson();
  const notYet = (label: string) => () => Alert.alert(label, 'Not built yet');

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Component preview</Text>
          <NotificationBell count={requests.length} onPress={notYet('Requests')} />
        </View>

        {patients.map(patient => {
          const next = getNextAppointment(patient.appointments);
          const { past } = splitAppointments(patient.appointments);
          return (
            <View key={patient.id} style={styles.card}>
              <View style={styles.patientRow}>
                <InitialsAvatar name={patient.name} />
                <View style={styles.patientText}>
                  <Text style={styles.name}>{patient.name}</Text>
                  <Text style={styles.condition}>{patient.condition}</Text>
                </View>
                <StatusBadge hasUpcoming={!!next} />
              </View>
              <PermissionChips canAddQuestions={patient.canAddQuestions} canAddAnswers={patient.canAddAnswers} />
              {next && (
                <>
                  <SectionLabel>Upcoming appointment</SectionLabel>
                  <AppointmentCard appointment={next} actions={[{ label: 'Add questions', onPress: notYet('Add questions') }]} />
                </>
              )}
              {past[0] && (
                <>
                  <SectionLabel>Past appointment (two buttons)</SectionLabel>
                  <AppointmentCard
                    appointment={past[0]}
                    actions={[
                      { label: 'View questions', onPress: notYet('View questions') },
                      { label: "View doctor's answer", onPress: notYet("View doctor's answer") },
                    ]}
                  />
                </>
              )}
              <PillButton size="large" label="View more appointments" onPress={notYet('Appointments')} />
            </View>
          );
        })}

        <InitialsAvatar name="Steven Harper" size={50} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { padding: 24, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 20, fontWeight: '600' },
  card: { gap: 10, padding: 14, borderWidth: 1, borderColor: '#6750A4', borderRadius: 20 },
  patientRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  patientText: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#1D1B20' },
  condition: { fontSize: 12, color: 'rgba(60, 60, 67, 0.6)' },
});
