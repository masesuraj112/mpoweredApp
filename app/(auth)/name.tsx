import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';

// An attempt to invalidate names that are clearly not real names, but this is not foolproof. 
// We will need to do more research on how to validate names properly.
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;

export default function NameScreen() {
  const { data, updateData } = useOnboarding();
  const [name, setName] = useState(data.name);

  const trimmed = name.trim();
  const isValid = trimmed.length > 0 && NAME_REGEX.test(trimmed);

  const handleContinue = () => {
    updateData({ name: trimmed });
    router.push('/(auth)/consent');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Your name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Type your name"
        style={styles.input}
        autoFocus
      />
      <Text style={styles.subtext}>Your health and wellbeing is uniquely YOU!</Text>
      <Pressable
        disabled={!name.trim()}
        onPress={handleContinue}
        style={[styles.continueButton, !name.trim() && styles.continueButtonDisabled]}
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