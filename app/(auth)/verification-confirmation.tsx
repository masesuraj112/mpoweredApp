import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { BrandText } from '@/components/brand/BrandText';
import { Button } from '@/components/ui/Button';
import { Fonts, Typography, makeStyles } from '@/constants/theme';

const SLIDE_DURATIONS = [5000, 6500] as const;

export default function VerificationConfirmationScreen() {
  const styles = useStyles();
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
    <AuthScreen
      footer={slide === 2 ? <Button label="Continue" variant="primary" onPress={handleContinue} /> : undefined}>
      {slide === 0 && (
        <>
          <Image
            source={require('../../assets/onboarding/verification-compass.png')}
            contentFit="contain"
            style={styles.illustration}
          />
          <BrandText accessibilityRole="header" style={styles.startMessage}>
            {'You’re off to an MPowered start!'}
          </BrandText>
        </>
      )}

      {slide === 1 && (
        <>
          <Image
            source={require('../../assets/onboarding/verification-checklist.png')}
            contentFit="contain"
            style={styles.illustration}
          />
          <Text style={styles.message}>
            Next, you’ll complete short questionnaires about how your pain is impacting you.
          </Text>
        </>
      )}

      {slide === 2 && (
        <>
          <Image
            source={require('../../assets/onboarding/verification-lightbulb.png')}
            contentFit="contain"
            style={styles.illustration}
          />
          <Text style={styles.message}>Based on your answers, this app suggests questions you can ask your doctor.</Text>
        </>
      )}
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  illustration: {
    alignSelf: 'center',
    width: 154,
    height: 154,
  },
  startMessage: {
    ...Typography.display,
    color: colors.text,
    textAlign: 'center',
  },
  message: {
    ...Typography.headline,
    fontFamily: Fonts.headingRegular,
    color: colors.text,
    textAlign: 'center',
  },
}));
