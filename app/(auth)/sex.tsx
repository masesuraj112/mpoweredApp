import { useOnboarding } from '@/context/Onboarding-Context';

import { router } from 'expo-router';

import { useState } from 'react';

import { Pressable, Text, View } from 'react-native';


import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

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
    <Button
      label="Continue"
      variant="primary"
      onPress={handleContinue}
      disabled={!selected}
    />
      <Text style={styles.tip}>💡 Research shows that people may experience pain differently depending on their sex</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  container: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.six, alignItems: 'center' },
  title: { color: colors.text, ...Typography.title, marginBottom: Spacing.five },
  option: { width: '100%', backgroundColor: colors.surfaceContainer, borderRadius: Radius.card, paddingVertical: Spacing.three, alignItems: 'center', marginBottom: Spacing.two },
  optionSelected: { backgroundColor: colors.secondaryContainer },
  optionText: { color: colors.primary, fontWeight: '600', ...Typography.bodySmall },
  tip: { textAlign: 'center', color: colors.textSubtle, marginTop: Spacing.five, ...Typography.caption, paddingHorizontal: Spacing.three },
}));