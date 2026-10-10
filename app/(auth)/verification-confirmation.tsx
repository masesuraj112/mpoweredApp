import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

const SLIDE_DURATIONS = [5000, 6500] as const;

export default function VerificationConfirmationScreen() {
  const [slide, setSlide] = useState(0);
  const { width, height } = useWindowDimensions();
  const scale = Math.min(1, width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;

  useEffect(() => {
    if (slide >= SLIDE_DURATIONS.length) return;

    const timer = setTimeout(() => setSlide((current) => current + 1), SLIDE_DURATIONS[slide]);
    return () => clearTimeout(timer);
  }, [slide]);

  const handleContinue = () => router.replace('/(tabs)/home' as any);

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.canvas,
          {
            width: canvasWidth,
            height: canvasHeight,
            left: (width - canvasWidth) / 2,
            top: (height - canvasHeight) / 2,
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
            <Text
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
              You&apos;re off to an M
              <Text style={[styles.poweredWord, { fontSize: 20.64 * scale, lineHeight: 40 * scale }]}>
                Powered
              </Text>
              {' start!'}
            </Text>
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
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  illustration: {
    position: 'absolute',
  },
  startMessage: {
    position: 'absolute',
    color: '#000000',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  poweredWord: {
    fontWeight: '500',
  },
  questionnaireMessage: {
    position: 'absolute',
    color: '#000000',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  suggestionMessage: {
    position: 'absolute',
    color: '#000000',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  continueButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6750A4',
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});