import { useOnboarding } from '@/context/Onboarding-Context';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput } from 'react-native';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
export default function OtherConditionsScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
  const { data, updateData } = useOnboarding();
  const [text, setText] = useState(data.otherConditions);
  const { noDiagnosis } = useLocalSearchParams<{ noDiagnosis?: string }>();
  const isNoDiagnosisPath = noDiagnosis === '1';
  const doneBar = useKeyboardDoneBar();

  const handleContinue = () => {
    updateData({ otherConditions: text.trim() });
    router.push('/(auth)/login-bridge');
  };

  return (
    // Tapping anywhere outside the input closes the keyboard. Not exposed to screen readers.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>
          {isNoDiagnosisPath ? "Tell us what you're experiencing" : 'Do you have any other conditions?'}
        </Text>
        <Text style={styles.subtitle}>
          {isNoDiagnosisPath
            ? // DRAFT COPY — please review/replace before shipping
              "No diagnosis yet? That's okay — describe what you're feeling in your own words, and MPowered will still work for you."
            : "If none, press 'Continue'"}
        </Text>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={isNoDiagnosisPath ? 'Describe your symptoms or how you\'re feeling' : 'Type conditions or symptoms that you know'}
          placeholderTextColor={colors.textSubtle}
          multiline
          // Return adds a new line, so add a Done bar to close the keyboard.
          inputAccessoryViewID={doneBar.id}
          style={styles.input}
        />
        {doneBar.bar}
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.four, paddingTop: Spacing.six, paddingBottom: Spacing.six },
  title: { color: colors.text, ...Typography.titleSmall, textAlign: 'center', marginBottom: Spacing.two },
  subtitle: { textAlign: 'center', color: colors.textSubtle, marginBottom: Spacing.four },
  input: { color: colors.text, backgroundColor: colors.surfaceContainer, borderRadius: Radius.control, padding: Spacing.three, minHeight: 140, textAlignVertical: 'top', ...Typography.bodySmall, marginBottom: 'auto' },
  continueButton: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.five,
    minHeight: MinTapTarget,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    alignSelf: 'center',
  },
  continueText: { color: colors.onPrimary, fontWeight: '600', ...Typography.bodySmall },
}));