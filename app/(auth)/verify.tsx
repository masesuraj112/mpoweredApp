import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

export default function VerifyScreen() {
  const [code, setCode] = useState('');
  const [resendSecondsRemaining, setResendSecondsRemaining] = useState<number | null>(null);
  const codeInputRef = useRef<TextInput>(null);
  const { width, height } = useWindowDimensions();
  const scale = Math.min(1, width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;
  const isCodeComplete = code.length === 4;
  const hasResentCode = resendSecondsRemaining !== null;

  useEffect(() => {
    if (!hasResentCode) return;

    const timer = setInterval(() => {
      setResendSecondsRemaining((remaining) => {
        if (remaining === null || remaining <= 1) return null;
        return remaining - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasResentCode]);

  const handleCodeChange = (value: string) => setCode(value.replace(/\D/g, '').slice(0, 4));
  const handleResend = () => setResendSecondsRemaining(120);

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

        <View
          style={[
            styles.codeRow,
            {
              left: 51 * scale,
              top: 309 * scale,
              width: 228 * scale,
              height: 51 * scale,
            },
          ]}
        >
          {Array.from({ length: 4 }, (_, index) => (
            <Pressable
              key={index}
              accessibilityRole="button"
              accessibilityLabel={`Enter verification code, digit ${index + 1}`}
              onPress={() => codeInputRef.current?.focus()}
              style={[
                styles.codeCell,
                {
                  left: index * 59 * scale,
                  width: 51 * scale,
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
            maxLength={4}
            onChangeText={handleCodeChange}
            value={code}
            style={styles.hiddenInput}
          />
        </View>

        {hasResentCode ? (
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
              Sent!
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
              You can resend in {resendSecondsRemaining} {resendSecondsRemaining === 1 ? 'second' : 'seconds'}
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
              You can resend codes in two minutes
            </Text>
          </>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !isCodeComplete }}
          disabled={!isCodeComplete}
          style={[
            styles.verifyButton,
            {
              left: 40 * scale,
              top: 471 * scale,
              width: 333 * scale,
              height: 48 * scale,
              borderRadius: 12 * scale,
            },
            !isCodeComplete && styles.verifyButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.verifyText,
              { fontSize: 14 * scale, lineHeight: 20 * scale, letterSpacing: 0.1 * scale },
              !isCodeComplete && styles.verifyTextDisabled,
            ]}
          >
            Verify
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
    fontWeight: '500',
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
