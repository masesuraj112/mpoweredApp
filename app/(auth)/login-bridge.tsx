import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/Onboarding-Context';
import { authErrorMessage } from '@/features/auth/messages';
import { seesPatientIntro } from '@/features/auth/patientIntro';
import { createProfile } from '@/services/profile';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuthStyles } from '@/components/auth/authStyles';
import { Button } from '@/components/ui/Button';
import { Typography, makeStyles } from '@/constants/theme';

export default function LoginBridgeScreen() {
  const styles = useStyles();
  const auth = useAuthStyles();
  const { data } = useOnboarding();
  const { session, refreshProfile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    <AuthScreen
      footer={
        <Button
          label={isSaving ? 'Saving…' : 'Continue'}
          accessibilityLabel="Continue"
          variant="primary"
          disabled={isSaving}
          onPress={handleContinue}
        />
      }>
      <Text accessibilityRole="header" style={auth.title}>
        Thank you, {data.name || 'there'}
      </Text>
      <Text style={styles.message}>
        Finally, let’s link this information to your account so the next time you open this app, you can just log
        in
      </Text>
      {errorMessage !== null && (
        <Text accessibilityRole="alert" style={auth.error}>
          {errorMessage}
        </Text>
      )}
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  message: {
    ...Typography.subtitle,
    color: colors.text,
    textAlign: 'center',
  },
}));
