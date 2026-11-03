import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthOption } from '@/components/auth/AuthOption';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { AppText } from '@/components/ui/AppText';
import { useOnboarding } from '@/context/Onboarding-Context';

const OPTIONS = [
  { label: 'Female', value: 'female' as const },
  { label: 'Male', value: 'male' as const },
  { label: 'Prefer not to say', value: 'prefer not to say' as const },
];

export default function SexScreen() {
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState(data.sex);

  const handleContinue = () => {
    updateData({ sex: selected });
    router.push('/(auth)/demographics');
  };

  return (
    <AuthScreen>
      <AuthTitle>Your sex</AuthTitle>
      {OPTIONS.map((option) => (
        <AuthOption
          key={option.value}
          label={option.label}
          selected={selected === option.value}
          onPress={() => setSelected(option.value)}
        />
      ))}
      <AuthButton label="Continue" disabled={!selected} onPress={handleContinue} />
      <AppText variant="bodySmall" color="textSecondary" style={styles.centered}>
        💡 Research shows that people may experience pain differently depending on their sex
      </AppText>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
