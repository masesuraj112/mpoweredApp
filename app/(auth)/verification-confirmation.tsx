import { Image } from 'expo-image';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fitCanvas } from '@/features/auth/canvas';

import { Colors } from '@/constants/theme';
import { BrandText } from '@/components/brand/BrandText';
const SLIDE_DURATIONS = [5000, 6500] as const;

export default function VerificationConfirmationScreen() {
  const { refreshProfile } = useAuth();
  const [slide, setSlide] = useState(0);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { scale, canvasWidth, canvasHeight, left, top } = fitCanvas({ width, height }, insets);

  useEffect(() => {
    if (slide >= SLIDE_DURATIONS.length) return;

    const timer = setTimeout(() => setSlide((current) => current + 1), SLIDE_DURATIONS[slide]);
    return () => clearTimeout(timer);
  }, [slide]);

  // The root guard opens the tabs once the profile check reports that the profile exists.
  const handleContinue = () => refreshProfile();

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.canvas,
          {
            width: canvasWidth,
            height: canvasHeight,
            left,
            top,
          },
        ]}
      >
        {slide === 0 && (
          <>
            <Image
              source={require('../../assets/onboarding/verification-compass.png')}
              contentFit="contain"
              style={[
                styles.illustration,
                { left: 137 * scale, top: 240 * scale, width: 154 * scale, height: 154 * scale },
              ]}
            />
            <BrandText
              style={[
                styles.startMessage,
                {
                  left: 65.5 * scale,
                  top: 451 * scale,
                  width: 281 * scale,
                  height: 64 * scale,
                  fontSize: 32 * scale,
                  lineHeight: 40 * scale,
                },
              ]}
            >
              {'You’re off to an MPowered start!'}
            </BrandText>
          </>
        )}

        {slide === 1 && (
          <>
            <Image
              source={require('../../assets/onboarding/verification-checklist.png')}
              contentFit="contain"
              style={[
                styles.illustration,
                { left: 131 * scale, top: 233 * scale, width: 154 * scale, height: 154 * scale },
              ]}
            />
            <Text
              style={[
                styles.questionnaireMessage,
                {
                  left: 60 * scale,
                  top: 417 * scale,
                  width: 303 * scale,
                  height: 170 * scale,
                  fontSize: 28 * scale,
                  lineHeight: 36 * scale,
                },
              ]}
            >
              Next, you’ll complete short questionnaires about how your pain is impacting you.
            </Text>
          </>
        )}

        {slide === 2 && (
          <>
            <Image
              source={require('../../assets/onboarding/verification-lightbulb.png')}
              contentFit="contain"
              style={[
                styles.illustration,
                { left: 129 * scale, top: 145 * scale, width: 154 * scale, height: 154 * scale },
              ]}
            />
            <Text
              style={[
                styles.suggestionMessage,
                {
                  left: 74 * scale,
                  top: 321 * scale,
                  width: 281 * scale,
                  height: 180 * scale,
                  fontSize: 28 * scale,
                  lineHeight: 36 * scale,
                },
              ]}
            >
              Based on your answers, this app suggests questions you can ask your doctor.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={handleContinue}
              style={[
                styles.continueButton,
                {
                  left: 61 * scale,
                  top: 554 * scale,
                  width: 306 * scale,
                  height: 64 * scale,
                  borderRadius: 16 * scale,
                },
              ]}
            >
              <Text
                style={[
                  styles.continueText,
                  { fontSize: 22 * scale, lineHeight: 28 * scale },
                ]}
              >
                Continue
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  canvas: {
    position: 'absolute',
    backgroundColor: Colors.light.surface,
  },
  illustration: {
    position: 'absolute',
  },
  startMessage: {
    position: 'absolute',
    color: Colors.light.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  questionnaireMessage: {
    position: 'absolute',
    color: Colors.light.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  suggestionMessage: {
    position: 'absolute',
    color: Colors.light.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  continueButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
  },
  continueText: {
    color: Colors.light.onPrimary,
    fontWeight: '600',
  },
});