import { router } from 'expo-router';
import { Linking, StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AppText } from '@/components/ui/AppText';
import { Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/Onboarding-Context';

// TODO: confirm final URLs with the team before shipping
const TERMS_URL = 'https://mpowered.example/terms';
const PRIVACY_URL = 'https://mpowered.example/privacy';

export default function ConsentScreen() {
  const { data } = useOnboarding();

  // Support persons only need a name and a phone number, so the patient questions are skipped.
  const handleContinue = () =>
    router.push(data.userType === 'support-person' ? '/(auth)/login-bridge' : '/(auth)/sex');

  return (
    <AuthScreen>
      <AppText accessibilityRole="header" variant="titleLarge">
        Hello {data.name || 'there'} 👋
      </AppText>
      <AppText variant="titleMedium" style={styles.body}>
        A few quick questions so we can make things more relevant for you
      </AppText>

      <AuthButton label="Continue" onPress={handleContinue} />

      <AppText variant="bodyMediumRegular">
        By continuing you agree to MPowered&apos;s{' '}
        <AppText
          accessibilityRole="link"
          variant="labelLargeBold"
          style={styles.link}
          onPress={() => Linking.openURL(TERMS_URL)}
        >
          Terms and Conditions
        </AppText>{' '}
        and{' '}
        <AppText
          accessibilityRole="link"
          variant="labelLargeBold"
          style={styles.link}
          onPress={() => Linking.openURL(PRIVACY_URL)}
        >
          Privacy Policy
        </AppText>
      </AppText>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    marginBottom: Spacing.three,
  },
  link: {
    textDecorationLine: 'underline',
  },
});
