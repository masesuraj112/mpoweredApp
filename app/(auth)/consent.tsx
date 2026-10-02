import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

// TODO: confirm final URLs with the team before shipping
const TERMS_URL = 'https://mpowered.example/terms';
const PRIVACY_URL = 'https://mpowered.example/privacy';

export default function ConsentScreen() {
  const { data } = useOnboarding();

  const handleContinue = () => router.push('/(auth)/demographics');

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello {data.name || 'there'} 👋</Text>
      <Text style={styles.body}>A few quick questions so we can make things more relevant for you</Text>

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>

      <Text style={styles.legal}>
        By continuing you agree to MPowered's{' '}
        <Text style={styles.link} onPress={() => Linking.openURL(TERMS_URL)}>Terms and Conditions</Text>
        {' '}and{' '}
        <Text style={styles.link} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16
  },
  body: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
    marginBottom: 32
  },
  continueButton: {
    backgroundColor: '#5B3FA5',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 24
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  legal: {
    fontSize: 15,
    lineHeight: 22
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
});