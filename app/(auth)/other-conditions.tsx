import { useOnboarding } from '@/context/Onboarding-Context';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from 'react-native';

export default function OtherConditionsScreen() {
  const { data, updateData } = useOnboarding();
  const [text, setText] = useState(data.otherConditions);
  const { noDiagnosis } = useLocalSearchParams<{ noDiagnosis?: string }>();
  const isNoDiagnosisPath = noDiagnosis === '1';

  const handleContinue = () => {
    updateData({ otherConditions: text.trim() });
    router.push('/(auth)/login-bridge');
  };

  return (
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
        placeholderTextColor="#8A8590"
        multiline
        style={styles.input}
      />
      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 100, paddingBottom: 64 },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  subtitle: { textAlign: 'center', color: '#8A8590', marginBottom: 24 },
  input: { backgroundColor: '#EDE9F5', borderRadius: 8, padding: 16, minHeight: 140, textAlignVertical: 'top', fontSize: 15, marginBottom: 'auto' },
  continueButton: { backgroundColor: '#6750A4', width: '100%', maxWidth: 306, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 40 },
  continueText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});