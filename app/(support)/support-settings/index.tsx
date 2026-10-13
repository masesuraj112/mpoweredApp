import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder until step 7 of docs/support-person-frontend.md builds the support person Settings.
export default function SupportSettingsScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <Text>Settings (coming soon)</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
