import { useEffect, useRef, useState } from 'react';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router } from 'expo-router';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View, type TextInputInstance } from 'react-native';

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
import { formatForDisplay, toE164 } from '@/features/auth/phone';
import { toProfileArgs } from '@/features/auth/profile';
import { hasProfile, sendVerificationCode, verifyCode } from '@/services/auth';
import { createProfile } from '@/services/profile';

// Six cells: 6 * 40 + 5 * 10 = 290 wide
const CODE_CELL_WIDTH = 40;
const CODE_CELL_GAP = 10;
const CODE_ROW_WIDTH = OTP_LENGTH * CODE_CELL_WIDTH + (OTP_LENGTH - 1) * CODE_CELL_GAP;

export default function VerifyScreen() {
  const { data } = useOnboarding();
  const { refreshProfile } = useAuth();
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
  const { width, height } = useWindowDimensions();
  const scale = Math.min(1, width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;
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
  // After a good code: returning users go home, new users get a profile made, and a user who
  // has no profile and no onboarding answers (signed in with an unknown number) is sent to
  // onboarding. The root guard moves anyone with a profile to the tabs.
  const finishSignIn = async () => {
    const profile = await hasProfile();
    if (!profile.ok) {
      setErrorMessage(authErrorMessage(profile.error.code));
      return;
    }
    if (profile.data) {
      refreshProfile();
      return;
    }
    if (!toProfileArgs(data).ok) {
      router.replace('/(auth)/user-type' as any);
      return;
    }
    const created = await createProfile(data);
    if (!created.ok) {
      setErrorMessage(authErrorMessage(created.error.code));
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
    const result = await verifyCode(data.phoneNumber, code);
    if (!result.ok) {
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
              onPress={() => codeInputRef.current?.focus()}
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
              {hasResent ? 'Sent!' : 'Code sent. Allow up to 30 seconds.'}
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
    backgroundColor: '#FFFFFF',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  title: {
    position: 'absolute',
    color: '#000000',
    fontWeight: '500',
  },
  phoneNumber: {
    position: 'absolute',
    color: '#000000',
    fontWeight: '600',
  },
  codeRow: {
    position: 'absolute',
  },
  codeCell: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E7E0EC',
    borderColor: '#79747E',
  },
  codeDigit: {
    color: '#000000',
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
    color: '#000000',
    fontWeight: '500',
  },
  resendButton: {
    justifyContent: 'center',
  },
  resendText: {
    color: '#6155F5',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  resendStatus: {
    position: 'absolute',
    color: '#000000',
    fontWeight: '500',
  },
  resendCountdown: {
    position: 'absolute',
    color: '#898A8D',
    fontWeight: '500',
  },
  errorText: {
    position: 'absolute',
    color: '#B3261E',
  },
  verifyButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6750A4',
  },
  verifyButtonDisabled: {
    backgroundColor: '#EADDFF',
  },
  verifyText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  verifyTextDisabled: {
    color: '#6750A4',
  },
});
