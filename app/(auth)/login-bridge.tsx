import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/Onboarding-Context';
import { authErrorMessage } from '@/features/auth/messages';
import { seesPatientIntro } from '@/features/auth/patientIntro';
import { createProfile } from '@/services/profile';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fitCanvas } from '@/features/auth/canvas';

import { Colors } from '@/constants/theme';
export default function LoginBridgeScreen() {
  const { data } = useOnboarding();
  const { session, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { scale, canvasWidth, canvasHeight, left, top } = fitCanvas({ width, height }, insets);

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
    // The slides are about the patient questionnaires; a support person goes straight to their app.
    if (!seesPatientIntro(data.userType)) {
      refreshProfile();
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
            left,
            top,
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
    backgroundColor: Colors.light.surface,
  },
  canvas: {
    position: 'absolute',
    backgroundColor: Colors.light.surface,
  },
  copy: {
    position: 'absolute',
    justifyContent: 'center',
  },
  greeting: {
    color: Colors.light.text,
    fontWeight: '500',
    marginBottom: 28,
  },
  message: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  continueButton: {
    position: 'absolute',
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    position: 'absolute',
    color: Colors.light.error,
    textAlign: 'center',
  },
  continueText: {
    color: Colors.light.onPrimary,
    fontWeight: '600',
  },
});
