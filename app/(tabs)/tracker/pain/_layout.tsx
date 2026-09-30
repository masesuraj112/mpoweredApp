import { PainAssessmentProvider } from '@/features/assessments/pain/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function PainTrackerHeader({ navigation }: { navigation: { goBack: () => void } }) {
  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
        accessibilityLabel="Back"
        style={styles.backButton}
      >
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.topBarTitle}>Pain Tracker</Text>
    </View>
  );
}

export default function PainLayout() {
  return (
    <PainAssessmentProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          header: ({ navigation }) => <PainTrackerHeader navigation={navigation} />,
        }}
      >
        <Stack.Screen name="summary" options={{ headerShown: false }} />
      </Stack>
    </PainAssessmentProvider>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: scaleHeight(109),
    backgroundColor: '#E8DEF8',
    paddingTop: scaleHeight(52),
    paddingHorizontal: scaleWidth(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scaleHeight(40),
  },
  backArrow: {
    fontSize: scaleFont(28),
    lineHeight: scaleFont(28),
    color: '#49454F',
    marginRight: scaleWidth(8),
  },
  backText: {
    fontSize: scaleFont(16),
    color: '#49454F',
  },
  topBarTitle: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#000000',
  },
});