import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/Onboarding-Context';
import { authErrorMessage } from '@/features/auth/messages';
import { createProfile } from '@/services/profile';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

export default function LoginBridgeScreen() {
  const { data } = useOnboarding();
  const { session } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { width, height } = useWindowDimensions();
  const scale = Math.min(1, width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;

  // A user who is already signed in (they verified a number that had no profile) has nothing
  // left to verify, so the profile is created here instead of going through phone and verify.
  const handleContinue = async () => {
    if (!session) {
      router.push('/(auth)/phone');
      return;
    }
    if (isSaving) return;
    setErrorMessage(null);
    setIsSaving(true);
    // the number they signed in with, in case the phone screen was never filled in
    const phoneNumber = session.user.phone || data.phoneNumber;
    const created = await createProfile({ ...data, phoneNumber });
    setIsSaving(false);
    if (!created.ok) {
      setErrorMessage(authErrorMessage(created.error.code));
      return;
    }
    router.replace('/(auth)/verification-confirmation' as any);
  };

  return (
    <View style={styles.container}>
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
        <View
          style={[
            styles.copy,
            {
              top: 136 * scale,
              left: 41 * scale,
              width: 313 * scale,
              height: 300 * scale,
            },
          ]}
        >
          <Text style={[styles.greeting, { fontSize: 22 * scale, lineHeight: 28 * scale }]}>
            Thank you, {data.name || 'there'} 😃
          </Text>
          <Text style={[styles.message, { fontSize: 22 * scale, lineHeight: 28 * scale }]}>
            {"Finally, let’s link this\ninformation to your account so\nthe next time you open this app,\nyou can just log in"}
          </Text>
        </View>
        <Pressable
          style={[
            styles.continueButton,
            {
              left: 40 * scale,
              top: 412 * scale,
              width: 333 * scale,
              height: 48 * scale,
              borderRadius: 12 * scale,
            },
          ]}
          disabled={isSaving}
          onPress={handleContinue}
        >
          <Text style={[styles.continueText, { fontSize: 14 * scale, lineHeight: 20 * scale }]}>
            {isSaving ? 'Saving…' : 'Continue'}
          </Text>
        </Pressable>
        {errorMessage !== null && (
          <Text
            accessibilityRole="alert"
            style={[
              styles.errorText,
              {
                left: 40 * scale,
                top: 476 * scale,
                width: 333 * scale,
                fontSize: 12 * scale,
                lineHeight: 16 * scale,
              },
            ]}
          >
            {errorMessage}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  copy: {
    position: 'absolute',
    justifyContent: 'center',
  },
  greeting: {
    color: '#1D1B20',
    fontWeight: '500',
    marginBottom: 28,
  },
  message: {
    color: '#1D1B20',
    fontWeight: '500',
  },
  continueButton: {
    position: 'absolute',
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    position: 'absolute',
    color: '#B3261E',
    textAlign: 'center',
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
  },
});
