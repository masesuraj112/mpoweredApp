import { useOnboarding } from '@/context/Onboarding-Context';

import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';

import { router } from 'expo-router';

import { useState } from 'react';

import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput } from 'react-native';


import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

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
        <Button
          label="Continue"
          variant="primary"
          onPress={handleContinue}
        />
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    alignItems: 'center'
  },
  title: { color: colors.text, 
    ...Typography.title, 
    marginBottom: Spacing.five 
  },
  input: {
    color: colors.text,
    width: '100%', 
    backgroundColor: colors.surfaceContainer,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    ...Typography.bodyLarge,
  },
  nameError: {
    color: colors.error,
    ...Typography.caption,
    marginTop: Spacing.two,
    textAlign: 'center',
  },
  subtext: { 
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
    color: colors.text
  },
  footnote: { 
    textAlign: 'center',
    color: colors.textSubtle,
    marginTop: Spacing.four,
    ...Typography.caption
  },
}));
