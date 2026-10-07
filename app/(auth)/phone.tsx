import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

const formatPhoneNumber = (digits: string) => {
  const localNumber = digits.slice(0, 10);
  if (localNumber.length <= 4) return localNumber;
  if (localNumber.length <= 7) return `${localNumber.slice(0, 4)} ${localNumber.slice(4)}`;
  return `${localNumber.slice(0, 4)} ${localNumber.slice(4, 7)} ${localNumber.slice(7)}`;
};

export default function PhoneScreen() {
  const { data, updateData } = useOnboarding();
  const [phoneNumber, setPhoneNumber] = useState(formatPhoneNumber(data.phoneNumber.replace(/\D/g, '')));
  const phoneNumberDigits = phoneNumber.replace(/\D/g, '').slice(0, 10);
  const isValidPhoneNumber = /^04\d{8}$/.test(phoneNumberDigits);
  const { width, height } = useWindowDimensions();
  const scale = Math.min(1, width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;

  const handleContinue = () => router.push('/(auth)/verify' as any);

  const handlePhoneNumberChange = (value: string) => {
    const nextPhoneNumberDigits = value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(formatPhoneNumber(nextPhoneNumberDigits));
    updateData({ phoneNumber: nextPhoneNumberDigits });
  };

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.canvas,
          {
            width: canvasWidth,
            height: canvasHeight,
            left: (width - canvasWidth) / 2,
            top: (height - canvasHeight) / 2,
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
              borderBottomColor: isValidPhoneNumber ? '#6750A4' : '#49454F',
            },
          ]}
        >
          <TextInput
            accessibilityLabel="Phone number"
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            placeholder="04xx xxx xxx"
            placeholderTextColor="#1D1B20"
            keyboardType="phone-pad"
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
          We will send the four digit verification codes to this number
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !isValidPhoneNumber }}
          disabled={!isValidPhoneNumber}
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
            Continue
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  title: {
    position: 'absolute',
    color: '#000000',
    textAlign: 'center',
    fontWeight: '500',
  },
  inputContainer: {
    position: 'absolute',
    backgroundColor: '#E6E0E9',
    borderBottomColor: '#49454F',
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    color: '#1D1B20',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  helperText: {
    position: 'absolute',
    color: '#000000',
    textAlign: 'center',
    textAlignVertical: 'center',
    fontWeight: '400',
  },
  continueButton: {
    position: 'absolute',
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#EADDFF',
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  continueTextDisabled: {
    color: '#6750A4',
  },
});
