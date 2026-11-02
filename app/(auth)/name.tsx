import { useOnboarding } from '@/context/Onboarding-Context';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput } from 'react-native';

import { makeStyles } from '@/constants/theme';
const isValidName = (value: string) =>
  /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(value.trim());

export default function NameScreen() {
  const styles = useStyles();
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name);
  const [showNameError, setShowNameError] = useState(false);
  const doneBar = useKeyboardDoneBar();
  const hasName = name.trim().length > 0;
  const isNameValid = hasName && isValidName(name);

  const handleContinue = () => {
    if (!isNameValid) {
      setShowNameError(true);
      return;
    }
    updateData({ name: name.trim() });
    router.push('/(auth)/consent');
  };

  return (
    // Tapping anywhere outside the input closes the keyboard. Not exposed to screen readers.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Your name</Text>
        <TextInput
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (isValidName(value)) setShowNameError(false);
          }}
          placeholder="Type your name"
          style={styles.input}
          maxLength={45}
          autoFocus
          returnKeyType="done"
          inputAccessoryViewID={doneBar.id}
        />
        {doneBar.bar}
        {showNameError && (
          <Text accessibilityRole="alert" style={styles.nameError}>
            Enter a name using letters, spaces, hyphens, or apostrophes (up to 45 characters).
          </Text>
        )}
        <Text style={styles.subtext}>Your health and wellbeing is uniquely YOU!</Text>
        <Pressable
          onPress={handleContinue}
          style={[styles.continueButton, !hasName && styles.continueButtonDisabled]}
        >
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
        <Text style={styles.footnote}>By having your name, we will know how to address you :)</Text>
      </KeyboardAvoidingView>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 100,
    alignItems: 'center'
  },
  title: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 32 
  },
  input: {
    width: '100%', 
    backgroundColor: colors.surfaceContainer,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  nameError: {
    color: colors.error,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  subtext: { 
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
    color: colors.text
  },
  continueButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center'
  },
  continueButtonDisabled: {
    backgroundColor: colors.secondaryContainer
  },
  continueText: {
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: 16 }
    ,
  footnote: { 
    textAlign: 'center',
    color: colors.textSubtle,
    marginTop: 24,
    fontSize: 13
  },
}));
