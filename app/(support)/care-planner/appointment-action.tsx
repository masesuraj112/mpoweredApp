import { BackHeader } from '@/components/mpowered/BackHeader';
import { Colors } from '@/constants/theme';
import { APPOINTMENT_ACTION_LABELS, type AppointmentActionType } from '@/features/support-person/permissions';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// TODO: open the Planner's question and answer screens (app/(tabs)/planner/questions.tsx, review.tsx)
// once they can show a supported patient's appointment. Not linked yet because:
// - they read the signed-in patient's own appointments (src/services/care-planner.ts, still mock data),
//   so these placeholder appointment ids don't exist there;
// - they don't check support person permissions, so "Add questions" only could still reach the answers.
// See risk 5 in docs/support-person-merge-plan.md.
export default function AppointmentActionScreen() {
  const { action } = useLocalSearchParams<{ action: AppointmentActionType; patientId: string; appointmentId: string }>();
  const title = APPOINTMENT_ACTION_LABELS[action] ?? 'Appointment';

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{ headerShown: true, header: () => <BackHeader title={title} onBack={() => router.back()} /> }}
      />
      <Text>{title} (coming soon)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.light.background },
});
