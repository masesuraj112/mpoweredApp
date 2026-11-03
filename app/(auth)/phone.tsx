import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { AppText } from '@/components/ui/AppText';
import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { Colors } from '@/constants/theme';
import { useOnboarding } from '@/context/Onboarding-Context';
import { authErrorMessage } from '@/features/auth/messages';
import { sendVerificationCode } from '@/services/auth';

const formatPhoneNumber = (digits: string) => {
  const localNumber = digits.slice(0, 10);
  if (localNumber.length <= 4) return localNumber;
  if (localNumber.length <= 7) return `${localNumber.slice(0, 4)} ${localNumber.slice(4)}`;
  return `${localNumber.slice(0, 4)} ${localNumber.slice(4, 7)} ${localNumber.slice(7)}`;
};

export default function PhoneScreen() {
  const { data, updateData } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(data.phoneNumber.replace(/\D/g, '')));
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const doneBar = useKeyboardDoneBar();
  const phoneNumberDigits = phoneNumber.replace(/\D/g, '').slice(0, 10);
  const isValidPhoneNumber = /^04\d{8}$/.test(phoneNumberDigits);

  const handleContinue = async () => {
    if (isSending) return;
    if (!isValidPhoneNumber) {
      setShowPhoneError(true);
      return;
    }
    setSendError(null);
    setIsSending(true);
    const result = await sendVerificationCode(phoneNumberDigits);
    setIsSending(false);
    if (!result.ok) {
      setSendError(authErrorMessage(result.error.code));
      return;
    }
    router.push('/(auth)/verify' as any);
  };

  const handlePhoneNumberChange = (value: string) => {
    const nextPhoneNumberDigits = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(formatPhoneNumber(nextPhoneNumberDigits));
    updateData({ phoneNumber: nextPhoneNumberDigits });
    setSendError(null);
    if (/^04\d{8}$/.test(nextPhoneNumberDigits)) setShowPhoneError(false);
  };

  return (
    <AuthScreen>
      <AuthTitle>Your phone number</AuthTitle>

      <AuthInput
        accessibilityLabel="Phone number"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        placeholder="04xx xxx xxx"
        keyboardType="phone-pad"
        // The iOS phone pad has no return key, so add a Done bar to close it.
        inputAccessoryViewID={doneBar.id}
        maxLength={12}
        // The underline turns purple once the number is complete.
        style={[styles.phoneInput, isValidPhoneNumber && styles.phoneInputValid]}
      />
      {doneBar.bar}

      <AppText variant="bodyLarge" style={styles.centered}>
        We will send the six digit verification codes to this number
      </AppText>

      {(showPhoneError || sendError !== null) && (
        <AppText accessibilityRole="alert" variant="bodySmall" color="error" style={styles.centered}>
          {showPhoneError ? 'Please enter an Australian phone number in the format 04xx xxx xxx' : sendError}
        </AppText>
      )}

      <AuthButton
        label={isSending ? 'Sending…' : 'Continue'}
        accessibilityLabel="Continue"
        pale={!isValidPhoneNumber}
        disabled={isSending}
        busy={isSending}
        onPress={handleContinue}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  phoneInput: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.onSurfaceVariant,
  },
  phoneInputValid: {
    borderBottomColor: Colors.light.primary,
  },
});
