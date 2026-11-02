import { useEffect, useRef, useState } from 'react';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router, Stack } from 'expo-router';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View, type TextInputInstance } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fitCanvas } from '@/features/auth/canvas';

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

import { Colors } from '@/constants/theme';
// Six cells: 6 * 40 + 5 * 10 = 290 wide
const CODE_CELL_WIDTH = 40;
const CODE_CELL_GAP = 10;
const CODE_ROW_WIDTH = OTP_LENGTH * CODE_CELL_WIDTH + (OTP_LENGTH - 1) * CODE_CELL_GAP;

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
  const codeInputRef = useRef<TextInputInstance>(null);
  const doneBar = useKeyboardDoneBar();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { scale, canvasWidth, canvasHeight, left, top } = fitCanvas({ width, height }, insets);
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
    // Tapping anywhere outside the input closes the keyboard. Not exposed to screen readers.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      {/* Once the code is accepted the person is signed in, so going back to the phone screen would mislead. */}
      <Stack.Screen options={{ headerBackVisible: !isSignedIn, gestureEnabled: !isSignedIn }} />
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
              left: 47 * scale,
              top: 168 * scale,
              width: 313 * scale,
              height: 75 * scale,
              fontSize: 22 * scale,
              lineHeight: 28 * scale,
            },
          ]}
        >
          We’re sending the verification code to this number
        </Text>

        {displayPhone !== '' && (
          <Text
            accessibilityLabel={`Phone number ${displayPhone}`}
            style={[
              styles.phoneNumber,
              {
                left: 47 * scale,
                top: 252 * scale,
                width: 313 * scale,
                fontSize: 18 * scale,
                lineHeight: 24 * scale,
              },
            ]}
          >
            {displayPhone}
          </Text>
        )}

        <View
          style={[
            styles.codeRow,
            {
              left: 51 * scale,
              top: 309 * scale,
              width: CODE_ROW_WIDTH * scale,
              height: 51 * scale,
            },
          ]}
        >
          {Array.from({ length: OTP_LENGTH }, (_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Enter verification code, digit ${index + 1}`}
              onPress={() => focusCodeInput(codeInputRef.current)}
              style={[
                styles.codeCell,
                {
                  left: index * (CODE_CELL_WIDTH + CODE_CELL_GAP) * scale,
                  width: CODE_CELL_WIDTH * scale,
                  height: 51 * scale,
                  borderRadius: 5 * scale,
                  borderWidth: scale,
                },
              ]}
            >
              <Text style={[styles.codeDigit, { fontSize: 16 * scale, lineHeight: 24 * scale }]}>
                {code[index] ?? ''}
              </Text>
            </Pressable>
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
          {doneBar.bar}
        </View>

        {resendSecondsRemaining !== null ? (
          <>
            <Text
              style={[
                styles.resendStatus,
                {
                  left: 49 * scale,
                  top: 382 * scale,
                  width: 313 * scale,
                  height: 19 * scale,
                  fontSize: 16 * scale,
                  lineHeight: 24 * scale,
                  letterSpacing: 0.15 * scale,
                },
              ]}
            >
              {hasResent ? 'Sent!' : 'Code sent. This may take a moment.'}
            </Text>
            <Text
              style={[
                styles.resendCountdown,
                {
                  left: 49 * scale,
                  top: 405 * scale,
                  width: 313 * scale,
                  height: 19 * scale,
                  fontSize: 12 * scale,
                  lineHeight: 16 * scale,
                  letterSpacing: 0.5 * scale,
                },
              ]}
            >
              You can resend in {formatResendWait(resendSecondsRemaining)}
            </Text>
          </>
        ) : (
          <>
            <View
              style={[
                styles.resendRow,
                { left: 49 * scale, top: 380 * scale, height: 24 * scale, gap: 8 * scale },
              ]}
            >
              <Text
                style={[
                  styles.resendPrompt,
                  {
                    fontSize: 16 * scale,
                    lineHeight: 24 * scale,
                    letterSpacing: 0.15 * scale,
                  },
                ]}
              >
                Didn’t receive a code?
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={isResending}
                onPress={handleResend}
                style={styles.resendButton}
              >
                <Text
                  style={[
                    styles.resendText,
                    {
                      fontSize: 16 * scale,
                      lineHeight: 24 * scale,
                      letterSpacing: 0.15 * scale,
                    },
                  ]}
                >
                  Resend
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {errorMessage !== null && (
          <Text
            accessibilityRole="alert"
            style={[
              styles.errorText,
              {
                left: 49 * scale,
                top: 436 * scale,
                width: 313 * scale,
                fontSize: 12 * scale,
                lineHeight: 16 * scale,
              },
            ]}
          >
            {errorMessage}
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canVerify }}
          disabled={!canVerify}
          onPress={handleVerify}
          style={[
            styles.verifyButton,
            {
              left: 40 * scale,
              top: 471 * scale,
              width: 333 * scale,
              height: 48 * scale,
              borderRadius: 12 * scale,
            },
            !canVerify && styles.verifyButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.verifyText,
              { fontSize: 14 * scale, lineHeight: 20 * scale, letterSpacing: 0.1 * scale },
              !canVerify && styles.verifyTextDisabled,
            ]}
          >
            {isSignedIn ? 'Try again' : 'Verify'}
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
    fontWeight: '500',
  },
  phoneNumber: {
    position: 'absolute',
    color: Colors.light.text,
    fontWeight: '600',
  },
  codeRow: {
    position: 'absolute',
  },
  codeCell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceMuted,
    borderColor: Colors.light.outline,
  },
  codeDigit: {
    color: Colors.light.text,
    fontWeight: '400',
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  resendRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendPrompt: {
    color: Colors.light.text,
    fontWeight: '500',
  },
  resendButton: {
    justifyContent: 'center',
  },
  resendText: {
    color: Colors.light.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  resendStatus: {
    position: 'absolute',
    color: Colors.light.text,
    fontWeight: '500',
  },
  resendCountdown: {
    position: 'absolute',
    color: Colors.light.textSubtle,
    fontWeight: '500',
  },
  errorText: {
    position: 'absolute',
    color: Colors.light.error,
  },
  verifyButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
  },
  verifyButtonDisabled: {
    backgroundColor: Colors.light.secondaryContainer,
  },
  verifyText: {
    color: Colors.light.onPrimary,
    fontWeight: '600',
  },
  verifyTextDisabled: {
    color: Colors.light.primary,
  },
});
