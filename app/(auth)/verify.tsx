import { useEffect, useState } from 'react';
import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { router, Stack } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { CodeInput } from '@/components/auth/CodeInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { AppText } from '@/components/ui/AppText';
import { MinTapTarget, Spacing } from '@/constants/theme';

import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/Onboarding-Context';
import { authErrorMessage } from '@/features/auth/messages';
import {
  OTP_LENGTH,
  RESEND_SECONDS,
  formatResendWait,
  isCodeComplete as isOtpComplete,
  sanitiseCode,
} from '@/features/auth/otp';
import { nextStepAfterVerify } from '@/features/auth/afterVerify';
import { formatForDisplay, toE164 } from '@/features/auth/phone';
import { seesPatientIntro } from '@/features/auth/patientIntro';
import { toProfileArgs } from '@/features/auth/profile';
import { hasProfile, sendVerificationCode, verifyCode } from '@/services/auth';
import { createProfile } from '@/services/profile';

export default function VerifyScreen() {
  const { data } = useOnboarding();
  const { refreshProfile, holdSignIn } = useAuth();
  const [code, setCode] = useState('');
  // True once the code is accepted: from then on a retry only repeats the profile step
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // The code was sent on the phone screen just before this one, so the wait starts now.
  const [resendSecondsRemaining, setResendSecondsRemaining] = useState<number | null>(RESEND_SECONDS);
  const [hasResent, setHasResent] = useState(false);
  const doneBar = useKeyboardDoneBar();
  const isCodeComplete = isOtpComplete(code);
  const canVerify = (isSignedIn || isCodeComplete) && !isVerifying;
  const isCountingDown = resendSecondsRemaining !== null;
  const normalisedPhone = toE164(data.phoneNumber);
  const displayPhone = normalisedPhone.ok ? formatForDisplay(normalisedPhone.data) : '';

  useEffect(() => {
    if (!isCountingDown) return;

    const timer = setInterval(() => {
      setResendSecondsRemaining((remaining) => {
        if (remaining === null || remaining <= 1) return null;
        return remaining - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isCountingDown]);

  const handleCodeChange = (value: string) => {
    setCode(sanitiseCode(value));
    setErrorMessage(null);
  };
  const handleResend = async () => {
    if (isResending) return;
    setErrorMessage(null);
    setIsResending(true);
    const result = await sendVerificationCode(data.phoneNumber);
    setIsResending(false);
    if (!result.ok) {
      setErrorMessage(authErrorMessage(result.error.code));
      return;
    }
    setCode('');
    setHasResent(true);
    setResendSecondsRemaining(RESEND_SECONDS);
  };
  // After a good code, the next step depends on which button the person started from and whether the
  // number has an account (docs/backend/sign-up-sign-in-plan.md, 4.2). The root guard moves anyone
  // with a profile to the tabs, except while a sign-up is held to ask about an existing account.
  const finishSignIn = async () => {
    const profile = await hasProfile();
    if (!profile.ok) {
      setErrorMessage(authErrorMessage(profile.error.code));
      return;
    }
    const step = nextStepAfterVerify({
      intent: data.intent,
      hasProfile: profile.data,
      answersComplete: toProfileArgs(data).ok,
    });
    if (step !== 'account-exists') holdSignIn(false);
    if (step === 'home') {
      refreshProfile();
      return;
    }
    if (step === 'account-exists' || step === 'no-account') {
      router.replace({ pathname: '/(auth)/account-check', params: { reason: step } });
      return;
    }
    if (step === 'sign-up-questions') {
      router.replace('/(auth)/user-type' as any);
      return;
    }
    const created = await createProfile(data);
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

  const handleVerify = async () => {
    if (!canVerify) return;
    setErrorMessage(null);
    setIsVerifying(true);
    if (isSignedIn) {
      await finishSignIn();
      setIsVerifying(false);
      return;
    }
    // A sign-up holds the app back before the code is accepted, so an existing account can't open before
    // the person is asked about it (SU-10). finishSignIn releases the hold for every other case.
    if (data.intent === 'sign-up') holdSignIn(true);
    const result = await verifyCode(data.phoneNumber, code);
    if (!result.ok) {
      holdSignIn(false);
      setIsVerifying(false);
      setErrorMessage(authErrorMessage(result.error.code));
      // The server reports a wrong code and an expired one the same way, so both start over.
      if (result.error.code === 'INVALID_OTP' || result.error.code === 'OTP_EXPIRED') setCode('');
      return;
    }
    setIsSignedIn(true);
    await finishSignIn();
    setIsVerifying(false);
  };

  return (
    <AuthScreen>
      {/* Once the code is accepted the person is signed in, so going back to the phone screen would mislead. */}
      <Stack.Screen options={{ headerBackVisible: !isSignedIn, gestureEnabled: !isSignedIn }} />

      <AuthTitle>We’re sending the verification code to this number</AuthTitle>

      {displayPhone !== '' && (
        <AppText
          accessibilityLabel={`Phone number ${displayPhone}`}
          variant="titleMedium"
          style={styles.centered}
        >
          {displayPhone}
        </AppText>
      )}

      <CodeInput
        value={code}
        onChangeText={handleCodeChange}
        length={OTP_LENGTH}
        inputAccessoryViewID={doneBar.id}
      />
      {doneBar.bar}

      {resendSecondsRemaining !== null ? (
        <View style={styles.resendStatus}>
          <AppText variant="bodyLarge" style={styles.centered}>
            {hasResent ? 'Sent!' : 'Code sent. This may take a moment.'}
          </AppText>
          <AppText variant="labelMedium" color="textSecondary" style={styles.centered}>
            You can resend in {formatResendWait(resendSecondsRemaining)}
          </AppText>
        </View>
      ) : (
        <View style={styles.resendRow}>
          <AppText variant="bodyLarge">Didn’t receive a code?</AppText>
          <Pressable
            accessibilityRole="button"
            disabled={isResending}
            onPress={handleResend}
            style={styles.resendButton}
          >
            <AppText variant="bodyLarge" color="primary" style={styles.underlined}>
              Resend
            </AppText>
          </Pressable>
        </View>
      )}

      {errorMessage !== null && (
        <AppText accessibilityRole="alert" variant="bodySmall" color="error" style={styles.centered}>
          {errorMessage}
        </AppText>
      )}

      <AuthButton
        label={isSignedIn ? 'Try again' : 'Verify'}
        disabled={!canVerify}
        busy={isVerifying}
        onPress={handleVerify}
      />
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    textAlign: 'center',
  },
  resendStatus: {
    gap: Spacing.one,
  },
  resendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: Spacing.two,
  },
  resendButton: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
  },
  underlined: {
    textDecorationLine: 'underline',
  },
});
