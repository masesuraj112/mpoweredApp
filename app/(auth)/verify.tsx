import { useEffect, useRef, useState } from 'react';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router, Stack } from 'expo-router';
import { Pressable, Text, TextInput, View, type TextInputInstance } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuthStyles } from '@/components/auth/authStyles';
import { Button } from '@/components/ui/Button';

import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/Onboarding-Context';
import { focusCodeInput } from '@/features/auth/focusCodeInput';
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

import { MinTapTarget, Radius, Spacing, Typography, makeStyles } from '@/constants/theme';

export default function VerifyScreen() {
  const styles = useStyles();
  const auth = useAuthStyles();
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
  const codeInputRef = useRef<TextInputInstance>(null);
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
    <AuthScreen
      footer={
        <Button
          label={isSignedIn ? 'Try again' : 'Verify'}
          variant="primary"
          disabled={!canVerify}
          onPress={handleVerify}
        />
      }>
      {/* Once the code is accepted the person is signed in, so going back to the phone screen would mislead. */}
      <Stack.Screen options={{ headerBackVisible: !isSignedIn, gestureEnabled: !isSignedIn }} />
      <Text accessibilityRole="header" style={auth.title}>
        We’re sending the verification code to this number
      </Text>
      {displayPhone !== '' && (
        <Text accessibilityLabel={`Phone number ${displayPhone}`} style={styles.phoneNumber}>
          {displayPhone}
        </Text>
      )}

      {/* The boxes only show the code; one hidden input takes it, so the keyboard's code suggestion fills all six. */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enter verification code"
        onPress={() => focusCodeInput(codeInputRef.current)}
        style={styles.codeRow}>
        {Array.from({ length: OTP_LENGTH }, (_, index) => (
          <View key={index} style={[styles.codeCell, index === code.length && styles.codeCellNext]}>
            <Text style={styles.codeDigit}>{code[index] ?? ''}</Text>
          </View>
        ))}
        <TextInput
          ref={codeInputRef}
          // Open the keyboard (and the iOS code suggestion) as soon as the screen shows.
          autoFocus
          accessibilityLabel="Verification code"
          autoComplete="one-time-code"
          keyboardType="number-pad"
          // The iOS number pad has no return key, so add a Done bar to close it.
          inputAccessoryViewID={doneBar.id}
          maxLength={OTP_LENGTH}
          onChangeText={handleCodeChange}
          value={code}
          style={styles.hiddenInput}
        />
      </Pressable>
      {doneBar.bar}

      {resendSecondsRemaining !== null ? (
        <View style={styles.resend}>
          <Text style={styles.resendStatus}>{hasResent ? 'Sent!' : 'Code sent. This may take a moment.'}</Text>
          <Text style={styles.resendCountdown}>You can resend in {formatResendWait(resendSecondsRemaining)}</Text>
        </View>
      ) : (
        <View style={styles.resendRow}>
          <Text style={styles.resendStatus}>Didn’t receive a code?</Text>
          <Pressable
            accessibilityRole="button"
            disabled={isResending}
            onPress={handleResend}
            style={styles.resendButton}>
            <Text style={styles.resendText}>Resend</Text>
          </Pressable>
        </View>
      )}

      {errorMessage !== null && (
        <Text accessibilityRole="alert" style={auth.error}>
          {errorMessage}
        </Text>
      )}
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  phoneNumber: {
    ...Typography.subtitle,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.two,
    minHeight: MinTapTarget,
  },
  codeCell: {
    flex: 1,
    maxWidth: 52,
    aspectRatio: 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.control,
    backgroundColor: colors.surface,
  },
  codeCellNext: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  codeDigit: {
    ...Typography.title,
    color: colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resend: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  resendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  resendStatus: {
    ...Typography.bodyLarge,
    color: colors.text,
    textAlign: 'center',
  },
  resendCountdown: {
    ...Typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resendButton: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
  },
  resendText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.primary,
    textDecorationLine: 'underline',
  },
}));
