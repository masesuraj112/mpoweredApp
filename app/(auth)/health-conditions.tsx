import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthOption } from '@/components/auth/AuthOption';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { AppText } from '@/components/ui/AppText';
import { useOnboarding } from '@/context/Onboarding-Context';

export default function HealthConditionsScreen() {
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
    <AuthScreen>
      <AuthTitle>
        Do you have a musculoskeletal (for example arthritis, back pain, gout) or chronic pain diagnosis from your doctor?
      </AuthTitle>
      <AuthOption label="Yes, I have" selected={selected === true} onPress={() => setSelected(true)} />
      <AuthOption label="No, I haven't" selected={selected === false} onPress={() => setSelected(false)} />
      <AppText variant="bodyMediumRegular" style={styles.centered}>
        No diagnosis? No problem! You know your body and how you feel so being Health M
        <AppText variant="labelSmall">Powered</AppText> is for you :)
      </AppText>
      <AuthButton label="Continue" disabled={selected === null} onPress={handleContinue} />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
