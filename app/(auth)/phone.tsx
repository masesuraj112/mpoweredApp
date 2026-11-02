import { useOnboarding } from '@/context/Onboarding-Context';
import { authErrorMessage } from '@/features/auth/messages';
import { sendVerificationCode } from '@/services/auth';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TextInput } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuthStyles } from '@/components/auth/authStyles';
import { Button } from '@/components/ui/Button';
import { makeStyles, useThemeColors } from '@/constants/theme';

const formatPhoneNumber = (digits: string) => {
  const localNumber = digits.slice(0, 10);
  if (localNumber.length <= 4) return localNumber;
  if (localNumber.length <= 7) return `${localNumber.slice(0, 4)} ${localNumber.slice(4)}`;
  return `${localNumber.slice(0, 4)} ${localNumber.slice(4, 7)} ${localNumber.slice(7)}`;
};

export default function PhoneScreen() {
  const styles = useStyles();
  const auth = useAuthStyles();
  const colors = useThemeColors();
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
    <AuthScreen
      footer={
        <Button
          label={isSending ? 'Sending…' : 'Continue'}
          accessibilityLabel="Continue"
          variant="primary"
          disabled={isSending}
          onPress={handleContinue}
        />
      }>
      <Text accessibilityRole="header" style={auth.title}>
        Your phone number
      </Text>
      <TextInput
        accessibilityLabel="Phone number"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        placeholder="04xx xxx xxx"
        placeholderTextColor={colors.textSubtle}
        keyboardType="phone-pad"
        // The iOS phone pad has no return key, so add a Done bar to close it.
        inputAccessoryViewID={doneBar.id}
        maxLength={12}
        style={[auth.input, styles.input, isValidPhoneNumber && auth.inputValid]}
      />
      {doneBar.bar}
      <Text style={auth.lead}>We will send the six digit verification codes to this number</Text>
      {(showPhoneError || sendError !== null) && (
        <Text accessibilityRole="alert" style={auth.error}>
          {showPhoneError ? 'Please enter an Australian phone number in the format 04xx xxx xxx' : sendError}
        </Text>
      )}
    </AuthScreen>
  );
}

const useStyles = makeStyles(() => ({
  input: {
    textAlign: 'center',
    letterSpacing: 1,
  },
}));
