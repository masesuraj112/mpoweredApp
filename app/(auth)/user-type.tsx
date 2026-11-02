import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuthStyles } from '@/components/auth/authStyles';
import { Button } from '@/components/ui/Button';
import { Radius, Spacing, Typography, makeStyles } from '@/constants/theme';

type UserType = 'patient' | 'support-person';

const OPTIONS: { id: UserType; title: string; description: string; benefits: string[] }[] = [
  {
    id: 'patient',
    title: 'I am a Patient',
    description: 'I am managing my own health journey',
    benefits: [
      'Track your symptoms and progress',
      'Connect with your care team',
      'Access personalised health insights',
    ],
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
  },
];

export default function UserTypeScreen() {
  const styles = useStyles();
  const auth = useAuthStyles();
  const { data, updateData } = useOnboarding();

  const handleContinue = () => router.push('/(auth)/name');

  return (
    <AuthScreen
      footer={
        <Button label="Continue" variant="primary" disabled={data.userType === null} onPress={handleContinue} />
      }>
      <Text accessibilityRole="header" style={auth.title}>
        Which describes you best?
      </Text>
      <Text style={auth.lead}>Tell us a little about yourself so we can personalise your experience.</Text>

      <View accessibilityRole="radiogroup" style={styles.options}>
        {OPTIONS.map((option) => {
          const selected = data.userType === option.id;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={option.title}
              accessibilityHint={option.description}
              onPress={() => updateData({ userType: option.id })}
              style={[styles.optionCard, selected && styles.optionCardSelected]}>
              <View style={styles.optionHeader}>
                <View style={styles.optionHeading}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                  {selected && <View style={styles.radioInner} />}
                </View>
              </View>
              <View style={styles.divider} />
              {option.benefits.map((benefit) => (
                <View key={benefit} style={styles.benefitRow}>
                  <View style={[styles.benefitBullet, selected && styles.benefitBulletSelected]} />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </Pressable>
          );
        })}
      </View>
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  options: {
    gap: Spacing.three,
  },
  optionCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  optionCardSelected: {
    backgroundColor: colors.secondaryContainer,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  optionHeading: {
    flex: 1,
    gap: Spacing.half,
  },
  optionTitle: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  optionDescription: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    borderWidth: 2,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.controlChecked,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: Radius.pill,
    backgroundColor: colors.controlChecked,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: Radius.pill,
    backgroundColor: colors.outline,
  },
  benefitBulletSelected: {
    backgroundColor: colors.primary,
  },
  benefitText: {
    flex: 1,
    ...Typography.bodySmall,
    color: colors.textSecondary,
  },
}));
