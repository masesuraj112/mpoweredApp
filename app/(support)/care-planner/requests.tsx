import { useSupportPerson } from '@/features/support-person/context';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder until step 5 of docs/support-person-frontend.md builds the requests screen.
export default function SupportRequestsScreen() {
  const { requests } = useSupportPerson();

  return (
    <SafeAreaView style={styles.screen}>
      <Text>Support person requests (coming soon)</Text>
      <Text>{requests.length} pending</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
});
