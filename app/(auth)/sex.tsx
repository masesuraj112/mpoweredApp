import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const OPTIONS = [
  { label: 'Female', value: 'female' as const },
  { label: 'Male', value: 'male' as const },
  { label: 'Prefer not to say', value: 'prefer not to say' as const },
];

export default function SexScreen() {
  const { data, updateData } = useOnboarding();
  const [selected, setSelected] = useState(data.sex);

  const handleContinue = () => {
    updateData({ sex: selected });
    router.push('/(auth)/demographics');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your sex</Text>
      {OPTIONS.map((opt) => (
        <Pressable
          key={opt.value}
          style={[styles.option, selected === opt.value && styles.optionSelected]}
          onPress={() => setSelected(opt.value)}
        >
          <Text style={styles.optionText}>{opt.label}</Text>
        </Pressable>
      ))}
      <Pressable style={styles.continueButton} onPress={handleContinue}>
        <Text style={styles.continueText}>Continue</Text>
      </Pressable>
      <Text style={styles.tip}>💡 Research shows that people may experience pain differently depending on their sex</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 100, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 32 },
  option: { width: '100%', backgroundColor: '#EDE9F5', borderRadius: 24, paddingVertical: 16, alignItems: 'center', marginBottom: 12 },
  optionSelected: { backgroundColor: '#D9D0EE' },
  optionText: { color: '#5B3FA5', fontWeight: '600', fontSize: 15 },
  continueButton: { backgroundColor: '#D9D0EE', width: '100%', paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginTop: 20 },
  continueText: { color: '#5B3FA5', fontWeight: '700', fontSize: 16 },
  tip: { textAlign: 'center', color: '#8A8590', marginTop: 32, fontSize: 13, paddingHorizontal: 16 },
});