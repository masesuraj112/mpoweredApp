import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';

const isValidName = (value: string) =>
  /^[\p{L}\p{M}]+(?:[ '\u2019-][\p{L}\p{M}]+)*$/u.test(value.trim());

export default function NameScreen() {
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name);
  const [showNameError, setShowNameError] = useState(false);
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
        maxLength={50}
        autoFocus
      />
      {showNameError && (
        <Text accessibilityRole="alert" style={styles.nameError}>
          Enter a name using letters, spaces, hyphens, or apostrophes (up to 50 characters).
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
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#EDE9F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  nameError: {
    color: '#B3261E',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  subtext: { 
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
    color: '#333'
  },
  continueButton: {
    backgroundColor: '#5B3FA5',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center'
  },
  continueButtonDisabled: {
    backgroundColor: '#D9D0EE'
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16 }
    ,
  footnote: { 
    textAlign: 'center',
    color: '#8A8590',
    marginTop: 24,
    fontSize: 13
  },
});
