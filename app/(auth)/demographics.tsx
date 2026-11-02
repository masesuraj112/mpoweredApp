import { useOnboarding } from '@/context/Onboarding-Context';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TextInput } from 'react-native';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
export default function DemographicsScreen() {
  const styles = useStyles();
  const { data, updateData } = useOnboarding();
  const [yearOfBirth, setYearOfBirth] = useState(data.yearOfBirth?.toString() ?? '');
  const currentYear = new Date().getFullYear();
  const doneBar = useKeyboardDoneBar();

  const handleContinue = () => {
    const parsedYear = yearOfBirth.trim() ? parseInt(yearOfBirth, 10) : null;
    const parsed = parsedYear === null ? null : Math.min(parsedYear, currentYear);
    if (parsed !== null && parsed.toString() !== yearOfBirth) setYearOfBirth(parsed.toString());
    updateData({ yearOfBirth: parsed });
    // The route exists in the app tree, but the generated Expo Router types can lag during local development.
    router.push('/(auth)/health-conditions' as any);
  };

  return (
    // Tapping anywhere outside the input closes the keyboard. Not exposed to screen readers.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={styles.title}>Your year of birth</Text>
        <Text style={styles.optional}>This question is optional</Text>
        <TextInput
          value={yearOfBirth}
          onChangeText={(value) => {
            const digits = value.replace(/\D/g, '').slice(0, 4);
            const parsedYear = digits.length === 4 ? parseInt(digits, 10) : null;
            setYearOfBirth(parsedYear !== null && parsedYear > currentYear ? String(currentYear) : digits);
          }}
          placeholder="YYYY"
          keyboardType="number-pad"
          // The iOS number pad has no return key, so add a Done bar to close it.
          inputAccessoryViewID={doneBar.id}
          maxLength={4}
          style={styles.input}
        />
        {doneBar.bar}
        <Pressable style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueText}>Continue</Text>
        </Pressable>
        <Text style={styles.tip}>Research shows that people can feel pain differently depending on their age</Text>
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
  title: {
    color: colors.text,
    ...Typography.display,
    marginBottom: Spacing.two
  },
  optional: {
    color: colors.textSubtle, marginBottom: Spacing.four 
  },
  input: {
    color: colors.text,
    width: '100%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    ...Typography.bodyLarge,
    textAlign: 'center',
    marginBottom: Spacing.five
  },
  continueButton: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    minHeight: MinTapTarget,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  continueText: {
    color: colors.onPrimary,
    fontWeight: '600',
    ...Typography.bodyLarge
  },
  tip: {
    textAlign: 'center',
    color: colors.textSubtle,
    marginTop: Spacing.four,
    ...Typography.caption,
    paddingHorizontal: Spacing.three
},
}));