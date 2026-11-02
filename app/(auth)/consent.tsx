import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { Linking, Pressable, Text, View } from 'react-native';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
// TODO: confirm final URLs with the team before shipping
const TERMS_URL = 'https://mpowered.example/terms';
const PRIVACY_URL = 'https://mpowered.example/privacy';

export default function ConsentScreen() {
  const styles = useStyles();
  const { data } = useOnboarding();

  // Support persons only need a name and a phone number, so the patient questions are skipped.
  const handleContinue = () =>
    router.push(data.userType === 'support-person' ? '/(auth)/login-bridge' : '/(auth)/sex');

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello {data.name || 'there'} 👋</Text>
      <Text style={styles.body}>A few quick questions so we can make things more relevant for you</Text>

      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>

      <Text style={styles.legal}>
        By continuing you agree to MPowered&apos;s{' '}
        <Text style={styles.link} onPress={() => Linking.openURL(TERMS_URL)}>Terms and Conditions</Text>
        {' '}and{' '}
        <Text style={styles.link} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy Policy</Text>
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six
  },
  greeting: {
    ...Typography.title,
    marginBottom: Spacing.three
  },
  body: {
    ...Typography.titleSmall,
    marginBottom: Spacing.five
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: Spacing.three,
    borderRadius: Radius.control,
    alignItems: 'center',
    marginBottom: Spacing.four,
    minHeight: MinTapTarget
  },
  continueText: {
    color: colors.onPrimary,
    fontWeight: '600',
    ...Typography.bodyLarge
  },
  legal: {
    ...Typography.bodySmall
  },
  link: {
    fontWeight: '700',
    textDecorationLine: 'underline'
  },
}));