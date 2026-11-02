import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { BrandText } from '@/components/brand/BrandText';
export default function HealthConditionsScreen() {
  const styles = useStyles();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState(data.hasDiagnosis);

  const handleContinue = () => {
  updateData({ hasDiagnosis: selected });
  if (selected) {
    router.push('/(auth)/diagnosis-conditions');
  } else {
    router.push({ pathname: '/(auth)/other-conditions', params: { noDiagnosis: '1' } });
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Do you have a musculoskeletal (for example arthritis, back pain, gout) or chronic pain diagnosis from your doctor?
      </Text>
      <Pressable
        style={[styles.option, selected === true && styles.optionSelected]}
        onPress={() => setSelected(true)}
      >
        <Text style={styles.optionText}>Yes, I have</Text>
      </Pressable>
      <Pressable
        style={[styles.option, selected === false && styles.optionSelected]}
        onPress={() => setSelected(false)}
      >
        <Text style={styles.optionText}>No, I haven&apos;t</Text>
      </Pressable>
      <BrandText style={styles.helperText}>
        {'No diagnosis? No problem! You know your body and how you feel so being Health MPowered is for you.'}
      </BrandText>
      <Pressable
        disabled={selected === null}
        style={[styles.continueButton, selected === null && styles.continueButtonDisabled]}
        onPress={handleContinue}
      >
        <Text style={[styles.continueText, selected === null && styles.continueTextDisabled]}>Continue</Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.six, alignItems: 'center' },
  title: { color: colors.text, ...Typography.titleSmall, textAlign: 'center', marginBottom: Spacing.five },
  option: { width: '100%', backgroundColor: colors.surfaceContainer, borderRadius: Radius.card, paddingVertical: Spacing.three, alignItems: 'center', marginBottom: Spacing.two },
  optionSelected: { backgroundColor: colors.secondaryContainer },
  optionText: { color: colors.primary, fontWeight: '600', ...Typography.bodySmall },
  helperText: { color: colors.text, textAlign: 'center', marginTop: Spacing.four, marginBottom: Spacing.five, ...Typography.bodySmall },
  continueButton: { backgroundColor: colors.primary, width: '100%', paddingVertical: Spacing.three, borderRadius: Radius.control, alignItems: 'center', minHeight: MinTapTarget },
  continueText: { color: colors.onPrimary, fontWeight: '700', ...Typography.bodyLarge },
  continueButtonDisabled: { backgroundColor: colors.secondaryContainer },
  continueTextDisabled: { color: colors.primary },
}));