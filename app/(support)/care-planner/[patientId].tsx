import { useSupportPerson } from '@/features/support-person/context';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder until step 6 of docs/support-person-frontend.md builds the patient's appointments screen.
export default function PatientAppointmentsScreen() {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { getPatient } = useSupportPerson();
  const patient = getPatient(patientId);

  return (
    <SafeAreaView style={styles.screen}>
      <Text>{patient ? `${patient.name}'s Appointments` : 'Patient not found'} (coming soon)</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
