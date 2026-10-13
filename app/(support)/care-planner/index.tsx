import { useSupportPerson } from '@/features/support-person/context';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder until step 4 of docs/support-person-frontend.md builds the Care Planner home.
export default function CarePlannerHomeScreen() {
  const { patients, requests } = useSupportPerson();

  return (
    <SafeAreaView style={styles.screen}>
      <Text>Care Planner (coming soon)</Text>
      <Text>
        Supporting {patients.length} people, {requests.length} pending requests
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
});
