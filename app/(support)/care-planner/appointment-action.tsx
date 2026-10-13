import { BackHeader } from '@/components/mpowered/BackHeader';
import { Colors } from '@/constants/theme';
import { APPOINTMENT_ACTION_LABELS, type AppointmentActionType } from '@/features/support-person/permissions';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// TODO: replace with the real question and answer screens once the Planner builds them
// (app/(tabs)/planner/questions.tsx and answer.tsx are still placeholders too).
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
