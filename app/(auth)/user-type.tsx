import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fitCanvas } from '@/features/auth/canvas';

import { makeStyles, useThemeColors } from '@/constants/theme';
type UserType = 'patient' | 'support-person';

const OPTIONS: {
  id: UserType;
  title: string;
  description: string;
  benefits: string[];
  top: number;
  titleLeft: number;
  descriptionLeft: number;
  descriptionWidth: number;
  descriptionTop: number;
  radioTop: number;
  dividerTop: number;
  benefitsTop: number[];
}[] = [
  {
    id: 'patient',
    title: 'I am a Patient',
    description: 'I am managing my own health journey',
    benefits: [
      'Track your symptoms and progress',
      'Connect with your care team',
      'Access personalised health insights',
    ],
    top: 198,
    titleLeft: 39,
    descriptionLeft: 39,
    descriptionWidth: 197,
    descriptionTop: 53,
    radioTop: 39,
    dividerTop: 99,
    benefitsTop: [113, 141, 169],
  },
  {
    id: 'support-person',
    title: 'I am a Support Person',
    description: 'I am helping someone else with their health',
    benefits: [
      "Monitor a loved one's wellbeing",
      'Coordinate care and appointments',
      'View and edit questions for appointments',
    ],
    top: 429,
    titleLeft: 35,
    descriptionLeft: 35,
    descriptionWidth: 194,
    descriptionTop: 50,
    radioTop: 46,
    dividerTop: 97,
    benefitsTop: [113, 141, 169],
  },
];

export default function UserTypeScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { scale, canvasWidth, canvasHeight, left, top } = fitCanvas({ width, height }, insets);

  const handleContinue = () => router.push('/(auth)/name');

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
        <Text
          style={[
            styles.title,
            { left: 57 * scale, top: 87 * scale, width: 295 * scale, fontSize: 22 * scale, lineHeight: 28 * scale },
          ]}
        >
          Which describes you best?
        </Text>
        <Text
          style={[
            styles.subtitle,
            {
              left: 57 * scale,
              top: 125 * scale,
              width: 295 * scale,
              fontSize: 16 * scale,
              lineHeight: 22.4 * scale,
              letterSpacing: 0.5 * scale,
            },
          ]}
        >
          Tell us a little about yourself so we can personalise your experience.
        </Text>

        {OPTIONS.map((option) => {
          const selected = data.userType === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.title}
              onPress={() => updateData({ userType: option.id })}
              style={[
                styles.optionCard,
                {
                  left: 24 * scale,
                  top: option.top * scale,
                  width: 364 * scale,
                  height: 215 * scale,
                  borderRadius: 16 * scale,
                  borderWidth: 2 * scale,
                },
                selected && styles.optionCardSelected,
              ]}
            >
              <Text
                style={[
                  styles.optionTitle,
                  {
                    left: option.titleLeft * scale,
                    top: (option.id === 'patient' ? 26 : 23) * scale,
                    fontSize: 16 * scale,
                    lineHeight: 24 * scale,
                    letterSpacing: 0.5 * scale,
                  },
                ]}
              >
                {option.title}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  {
                    left: option.descriptionLeft * scale,
                    top: option.descriptionTop * scale,
                    width: option.descriptionWidth * scale,
                    fontSize: 13 * scale,
                    lineHeight: 18 * scale,
                    letterSpacing: 0.4 * scale,
                  },
                ]}
              >
                {option.description}
              </Text>
              <View
                style={[
                  styles.radioOuter,
                  {
                    right: 24 * scale,
                    top: option.radioTop * scale,
                    width: 22 * scale,
                    height: 22 * scale,
                    borderRadius: 11 * scale,
                    borderWidth: 2 * scale,
                  },
                  selected && styles.radioOuterSelected,
                ]}
              >
                {selected && (
                  <View
                    style={[
                      styles.radioInner,
                      { width: 16 * scale, height: 16 * scale, borderRadius: 8 * scale },
                    ]}
                  />
                )}
              </View>
              <View
                style={[
                  styles.divider,
                  { top: option.dividerTop * scale, width: 360 * scale, left: 0, height: scale },
                ]}
              />
              {option.benefits.map((benefit, index) => (
                <View
                  key={benefit}
                  style={[
                    styles.benefitRow,
                    { left: 26 * scale, top: option.benefitsTop[index] * scale },
                  ]}
                >
                  <View
                    style={[
                      styles.benefitBullet,
                      {
                        width: 6 * scale,
                        height: 6 * scale,
                        borderRadius: 3 * scale,
                        marginRight: 10 * scale,
                        backgroundColor: selected ? colors.primary : colors.outline,
                      },
                    ]}
                  />
                  <Text style={[styles.benefitText, { fontSize: 14 * scale, lineHeight: 20 * scale, letterSpacing: 0.1 * scale }]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </Pressable>
          );
        })}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: data.userType === null }}
          disabled={data.userType === null}
          onPress={handleContinue}
          style={[
            styles.continueButton,
            {
              left: 24 * scale,
              top: 684 * scale,
              width: 364 * scale,
              height: 52 * scale,
              borderRadius: 16 * scale,
            },
            data.userType === null && styles.continueButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.continueText,
              { fontSize: 14 * scale, lineHeight: 20 * scale, letterSpacing: 0.1 * scale },
              data.userType === null && styles.continueTextDisabled,
            ]}
          >
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  canvas: {
    position: 'absolute',
    backgroundColor: colors.surface,
  },
  title: {
    position: 'absolute',
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  subtitle: {
    position: 'absolute',
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  optionCard: {
    position: 'absolute',
    backgroundColor: colors.background,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: colors.primary,
  },
  optionTitle: {
    position: 'absolute',
    color: colors.text,
    fontWeight: '600',
  },
  optionDescription: {
    position: 'absolute',
    color: colors.textSecondary,
    fontWeight: '400',
  },
  radioOuter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.outline,
  },
  radioOuterSelected: {
    backgroundColor: colors.primaryDeep,
  },
  radioInner: {
    backgroundColor: colors.primaryDeep,
  },
  divider: {
    position: 'absolute',
    backgroundColor: colors.surfaceContainer,
  },
  benefitRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitBullet: {},
  benefitText: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  continueButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  continueButtonDisabled: {
    backgroundColor: colors.surfaceContainer,
  },
  continueText: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  continueTextDisabled: {
    color: colors.textSecondary,
  },
}));