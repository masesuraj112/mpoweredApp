import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/context/AuthContext';

const SLIDE_DURATIONS = [5000, 6500] as const;
const ILLUSTRATION_SIZE = 154;

export default function VerificationConfirmationScreen() {
  const { refreshProfile } = useAuth();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (slide >= SLIDE_DURATIONS.length) return;

    const timer = setTimeout(() => setSlide((current) => current + 1), SLIDE_DURATIONS[slide]);
    return () => clearTimeout(timer);
  }, [slide]);

  // The root guard opens the tabs once the profile check reports that the profile exists.
  const handleContinue = () => refreshProfile();

  return (
    // No back arrow on these slides: the account is made, so there is nothing to go back to.
    <AuthScreen backArrow={false} center>
      {slide === 0 && (
        <>
          <Image
            source={require('../../assets/onboarding/verification-compass.png')}
            contentFit="contain"
            accessibilityLabel=""
            style={styles.illustration}
          />
          <AppText variant="headlineMedium" color="text" style={styles.message}>
            You&apos;re off to an M<AppText variant="titleLarge">Powered</AppText>
            {' start!'}
          </AppText>
        </>
      )}

      {slide === 1 && (
        <>
          <Image
            source={require('../../assets/onboarding/verification-checklist.png')}
            contentFit="contain"
            accessibilityLabel=""
            style={styles.illustration}
          />
          <AppText variant="headlineMedium" color="text" style={styles.message}>
            Next, you’ll complete short questionnaires about how your pain is impacting you.
          </AppText>
        </>
      )}

      {slide === 2 && (
        <>
          <Image
            source={require('../../assets/onboarding/verification-lightbulb.png')}
            contentFit="contain"
            accessibilityLabel=""
            style={styles.illustration}
          />
          <AppText variant="headlineMedium" color="text" style={styles.message}>
            Based on your answers, this app suggests questions you can ask your doctor.
          </AppText>
          <AuthButton label="Continue" onPress={handleContinue} />
        </>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  illustration: {
    alignSelf: 'center',
    width: ILLUSTRATION_SIZE,
    height: ILLUSTRATION_SIZE,
  },
  message: {
    textAlign: 'center',
  },
});
