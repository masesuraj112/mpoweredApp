import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { makeStyles } from '@/constants/theme';
const OPTIONS = [
  { label: 'Female', value: 'female' as const },
  { label: 'Male', value: 'male' as const },
  { label: 'Prefer not to say', value: 'prefer not to say' as const },
];

export default function SexScreen() {
  const styles = useStyles();
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState(data.sex);

  const handleContinue = () => {
    updateData({ sex: selected });
    router.push('/(auth)/demographics');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your sex</Text>
      {OPTIONS.map((opt) => (
        <Pressable
          key={opt.value}
          style={[styles.option, selected === opt.value && styles.optionSelected]}
          onPress={() => setSelected(opt.value)}
        >
          <Text style={styles.optionText}>{opt.label}</Text>
        </Pressable>
      ))}
    <Pressable
        disabled={!selected}
        style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
        onPress={handleContinue}
    >
  <Text style={[styles.continueText, !selected && styles.continueTextDisabled]}>Continue</Text>
    </Pressable>
      <Text style={styles.tip}>💡 Research shows that people may experience pain differently depending on their sex</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 100, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 32 },
  option: { width: '100%', backgroundColor: colors.surfaceContainer, borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  optionSelected: { backgroundColor: colors.secondaryContainer },
  optionText: { color: colors.primary, fontWeight: '600', fontSize: 15 },
  continueButton: { backgroundColor: colors.primary, width: '100%', paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginTop: 20 },
  continueButtonDisabled: { backgroundColor: colors.secondaryContainer },
  continueText: { color: colors.onPrimary, fontWeight: '700', fontSize: 16 },
  continueTextDisabled: { color: colors.primary },
  tip: { textAlign: 'center', color: colors.textSubtle, marginTop: 32, fontSize: 13, paddingHorizontal: 16 },
}));