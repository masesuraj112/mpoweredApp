import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TITLES: Record<string, string> = {
  'add-questions': 'Add questions',
  'add-answer': "Add doctor's answer",
  'view-questions': 'View questions',
  'view-answer': "View doctor's answer",
};

// TODO: replace with the real question and answer screens once the Planner builds them
// (app/(tabs)/planner/questions.tsx and answer.tsx are still placeholders too).
export default function AppointmentActionScreen() {
  const { action } = useLocalSearchParams<{ action: string; patientId: string; appointmentId: string }>();

  return (
    <SafeAreaView style={styles.screen}>
      <Text>{TITLES[action] ?? 'Appointment'} (coming soon)</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
