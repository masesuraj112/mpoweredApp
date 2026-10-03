import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function HealthConditionsScreen() {
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState(data.hasDiagnosis);

  const handleContinue = () => {
    updateData({ hasDiagnosis: selected });
    router.push('/(auth)/diagnosis-conditions');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Do you have a musculoskeletal (for example arthritis, back pain, gout) or chronic pain diagnosis from your doctor?
      </Text>
      <Pressable
        style={[styles.option, selected === true && styles.optionSelected]}
        onPress={() => setSelected(true)}
      >
        <Text style={styles.optionText}>Yes, I have</Text>
      </Pressable>
      <Pressable
        style={[styles.option, selected === false && styles.optionSelected]}
        onPress={() => setSelected(false)}
      >
        <Text style={styles.optionText}>No, I haven't</Text>
      </Pressable>
      <Text style={styles.helperText}>
        No diagnosis? No problem! You know your body and how you feel so being Health M<Text style={styles.superscript}>Powered</Text> is for you :)
      </Text>
      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 100, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 32 },
  option: { width: '100%', backgroundColor: '#EDE9F5', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  optionSelected: { backgroundColor: '#D9D0EE' },
  optionText: { color: '#5B3FA5', fontWeight: '600', fontSize: 15 },
  helperText: { textAlign: 'center', marginTop: 24, marginBottom: 32, fontSize: 15, lineHeight: 22 },
  superscript: { fontSize: 11 },
  continueButton: { backgroundColor: '#5B3FA5', width: '100%', paddingVertical: 16, borderRadius: 24, alignItems: 'center' },
  continueText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});