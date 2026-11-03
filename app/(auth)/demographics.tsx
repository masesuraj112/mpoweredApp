import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { AppText } from '@/components/ui/AppText';
import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { useOnboarding } from '@/context/Onboarding-Context';

export default function DemographicsScreen() {
  const { data, updateData } = useOnboarding();
  const [yearOfBirth, setYearOfBirth] = useState(data.yearOfBirth?.toString() ?? '');
  const currentYear = new Date().getFullYear();
  const doneBar = useKeyboardDoneBar();

  const handleContinue = () => {
    const parsedYear = yearOfBirth.trim() ? parseInt(yearOfBirth, 10) : null;
    const parsed = parsedYear === null ? null : Math.min(parsedYear, currentYear);
    if (parsed !== null && parsed.toString() !== yearOfBirth) setYearOfBirth(parsed.toString());
    updateData({ yearOfBirth: parsed });
    // The route exists in the app tree, but the generated Expo Router types can lag during local development.
    router.push('/(auth)/health-conditions' as any);
  };

  return (
    <AuthScreen>
      <AuthTitle>Your year of birth</AuthTitle>
      <AppText variant="bodyMediumRegular" color="textSecondary" style={styles.centered}>
        This question is optional
      </AppText>
      <AuthInput
        accessibilityLabel="Year of birth, optional"
        value={yearOfBirth}
        onChangeText={(value) => {
          const digits = value.replace(/\D/g, '').slice(0, 4);
          const parsedYear = digits.length === 4 ? parseInt(digits, 10) : null;
          setYearOfBirth(parsedYear !== null && parsedYear > currentYear ? String(currentYear) : digits);
        }}
        placeholder="YYYY"
        keyboardType="number-pad"
        // The iOS number pad has no return key, so add a Done bar to close it.
        inputAccessoryViewID={doneBar.id}
        maxLength={4}
        style={styles.centered}
      />
      {doneBar.bar}
      <AuthButton label="Continue" onPress={handleContinue} />
      <AppText variant="bodySmall" color="textSecondary" style={styles.centered}>
        💡 Research shows that people can feel pain differently depending on their age
      </AppText>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
});
