import { useOnboarding } from '@/context/Onboarding-Context';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput } from 'react-native';

import { makeStyles, useThemeColors } from '@/constants/theme';
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
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 100, paddingBottom: 64 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: colors.textSubtle, marginBottom: 24 },
  input: { backgroundColor: colors.surfaceContainer, borderRadius: 8, padding: 16, minHeight: 140, textAlignVertical: 'top', fontSize: 15, marginBottom: 'auto' },
  continueButton: { backgroundColor: colors.primary, width: '100%', maxWidth: 306, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 40 },
  continueText: { color: colors.onPrimary, fontWeight: '600', fontSize: 14 },
}));