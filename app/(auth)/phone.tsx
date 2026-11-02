import { useOnboarding } from '@/context/Onboarding-Context';
import { authErrorMessage } from '@/features/auth/messages';
import { sendVerificationCode } from '@/services/auth';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fitCanvas } from '@/features/auth/canvas';

import { Colors } from '@/constants/theme';
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
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { scale, canvasWidth, canvasHeight, left, top } = fitCanvas({ width, height }, insets);

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
    // Tapping anywhere outside the input closes the keyboard. Not exposed to screen readers.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <View
        style={[
          styles.canvas,
          {
            width: canvasWidth,
            height: canvasHeight,
            left,
            top,
          },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              left: 65 * scale,
              top: 198 * scale,
              width: 281 * scale,
              height: 28 * scale,
              fontSize: 22 * scale,
              lineHeight: 28 * scale,
            },
          ]}
        >
          Your phone number
        </Text>

        <View
          style={[
            styles.inputContainer,
            {
              left: 72 * scale,
              top: 245 * scale,
              width: 268 * scale,
              height: 56 * scale,
              borderTopLeftRadius: 4 * scale,
              borderTopRightRadius: 4 * scale,
              borderBottomWidth: scale,
              borderBottomColor: isValidPhoneNumber ? Colors.light.primary : Colors.light.outlineStrong,
            },
          ]}
        >
          <TextInput
            accessibilityLabel="Phone number"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            placeholder="04xx xxx xxx"
            placeholderTextColor={Colors.light.text}
            keyboardType="phone-pad"
            // The iOS phone pad has no return key, so add a Done bar to close it.
            inputAccessoryViewID={doneBar.id}
            maxLength={12}
            style={[
              styles.input,
              {
                paddingHorizontal: 16 * scale,
                fontSize: 16 * scale,
                lineHeight: 24 * scale,
                letterSpacing: 0.5 * scale,
              },
            ]}
          />
        </View>
        {doneBar.bar}

        <Text
          style={[
            styles.helperText,
            {
              left: 65 * scale,
              top: 333 * scale,
              width: 281 * scale,
              height: 71 * scale,
              fontSize: 16 * scale,
              lineHeight: 24 * scale,
              letterSpacing: 0.5 * scale,
            },
          ]}
        >
          We will send the six digit verification codes to this number
        </Text>

        {(showPhoneError || sendError !== null) && (
          <Text
            accessibilityRole="alert"
            style={[
              styles.phoneError,
              {
                left: 49 * scale,
                top: 405 * scale,
                width: 313 * scale,
                fontSize: 12 * scale,
                lineHeight: 16 * scale,
              },
            ]}
          >
            {showPhoneError
              ? 'Please enter an Australian phone number in the format 04xx xxx xxx'
              : sendError}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Continue"
          accessibilityState={{ busy: isSending }}
          disabled={isSending}
          onPress={handleContinue}
          style={[
            styles.continueButton,
            {
              left: 53 * scale,
              top: 462 * scale,
              width: 306 * scale,
              height: 52 * scale,
              borderRadius: 16 * scale,
            },
            !isValidPhoneNumber && styles.continueButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.continueText,
              { fontSize: 14 * scale, lineHeight: 20 * scale, letterSpacing: 0.1 * scale },
              !isValidPhoneNumber && styles.continueTextDisabled,
            ]}
          >
            {isSending ? 'Sending…' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  canvas: {
    position: 'absolute',
    backgroundColor: Colors.light.surface,
  },
  title: {
    position: 'absolute',
    color: Colors.light.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'absolute',
    backgroundColor: Colors.light.surfaceContainer,
    borderBottomColor: Colors.light.outlineStrong,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: Colors.light.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  helperText: {
    position: 'absolute',
    color: Colors.light.text,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  phoneError: {
    position: 'absolute',
    color: Colors.light.error,
    textAlign: 'center',
  },
  continueButton: {
    position: 'absolute',
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: Colors.light.secondaryContainer,
  },
  continueText: {
    color: Colors.light.onPrimary,
    fontWeight: '600',
  },
  continueTextDisabled: {
    color: Colors.light.primary,
  },
});
