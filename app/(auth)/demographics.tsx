import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';

export default function DemographicsScreen() {
  const { data, updateData } = useOnboarding();
  const [yearOfBirth, setYearOfBirth] = useState(data.yearOfBirth?.toString() ?? '');

  const handleContinue = () => {
    const parsed = yearOfBirth.trim() ? parseInt(yearOfBirth, 10) : null;
    updateData({ yearOfBirth: parsed });
    // The route exists in the app tree, but the generated Expo Router types can lag during local development.
    router.push('/(auth)/diagnosis' as any);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Your year of birth</Text>
      <Text style={styles.optional}>This question is optional</Text>
      <TextInput
        value={yearOfBirth}
        onChangeText={setYearOfBirth}
        placeholder="YYYY"
        keyboardType="number-pad"
        maxLength={4}
        style={styles.input}
      />
      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
      <Text style={styles.tip}>💡 Research shows that people can feel pain differently depending on their age</Text>
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
    marginBottom: 8
  },
  optional: {
    color: '#8A8590', marginBottom: 24 
  },
  input: {
    width: '100%',
    backgroundColor: '#EDE9F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40
  },
  continueButton: {
    backgroundColor: '#5B3FA5',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center'
  },
  continueText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  tip: {
    textAlign: 'center',
    color: '#8A8590',
    marginTop: 24,
    fontSize: 13,
    paddingHorizontal: 16
},
});