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

const isValidName = (value: string) =>
  /^[\p{L}\p{M}]+(?:[ '’-][\p{L}\p{M}]+)*$/u.test(value.trim());

export default function NameScreen() {
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name);
  const [showNameError, setShowNameError] = useState(false);
  const doneBar = useKeyboardDoneBar();
  const hasName = name.trim().length > 0;
  const isNameValid = hasName && isValidName(name);

  const handleContinue = () => {
    if (!isNameValid) {
      setShowNameError(true);
      return;
    }
    updateData({ name: name.trim() });
    router.push('/(auth)/consent');
  };

  return (
    <AuthScreen>
      <AuthTitle>Your name</AuthTitle>
      <AuthInput
        accessibilityLabel="Your name"
        value={name}
        onChangeText={(value) => {
          setName(value);
          if (isValidName(value)) setShowNameError(false);
        }}
        placeholder="Type your name"
        maxLength={45}
        autoFocus
        returnKeyType="done"
        inputAccessoryViewID={doneBar.id}
      />
      {doneBar.bar}
      {showNameError && (
        <AppText accessibilityRole="alert" variant="bodySmall" color="error" style={styles.centered}>
          Enter a name using letters, spaces, hyphens, or apostrophes (up to 45 characters).
        </AppText>
      )}
      <AppText variant="bodyMediumRegular" color="onSurface" style={[styles.centered, styles.italic]}>
        Your health and wellbeing is uniquely YOU!
      </AppText>
      <AuthButton label="Continue" pale={!hasName} onPress={handleContinue} />
      <AppText variant="bodySmall" color="textSecondary" style={styles.centered}>
        By having your name, we will know how to address you :)
      </AppText>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  italic: {
    fontStyle: 'italic',
  },
});
