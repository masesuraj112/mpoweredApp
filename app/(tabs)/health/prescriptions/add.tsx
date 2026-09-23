import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrescriptionsHeader } from '@/components/mpowered/PrescriptionsHeader';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

export default function AddPrescriptionScreen() {
  const [medicationName, setMedicationName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('');
  const [repeatEvery, setRepeatEvery] = useState('1');

  // TODO: wire these to a real dropdown/picker once one is added to the project
  const strengthUnit = 'mg';
  const form = 'tablets';
  const unitOfTime = 'day';

  const handleSave = () => {
    // TODO: persist to Supabase once prescriptions are wired up, e.g.
    // supabase.from('prescriptions').insert({ medicationName, strength, strengthUnit, form, dosage, repeatEvery, unitOfTime, users_id: userId })
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrescriptionsHeader title="Add prescription" />

        <Text style={styles.helperText}>Type the name of your medication</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Medication name</Text>
          <TextInput
            style={styles.input}
            value={medicationName}
            onChangeText={setMedicationName}
            placeholder="e.g. Perindopril arginine"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldGrow]}>
            <Text style={styles.label}>Strength</Text>
            <TextInput
              style={styles.input}
              value={strength}
              onChangeText={setStrength}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>
          <View style={[styles.field, styles.fieldFixed]}>
            <Text style={styles.label}>Strength unit</Text>
            <Pressable style={styles.dropdown}>
              <Text style={styles.dropdownText}>{strengthUnit}</Text>
              <Text style={styles.dropdownChevron}>⌄</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Form</Text>
          <Pressable style={[styles.dropdown, styles.dropdownFull]}>
            <Text style={styles.dropdownText}>{form}</Text>
            <Text style={styles.dropdownChevron}>⌄</Text>
          </Pressable>
        </View>

        <Text style={styles.helperText}>Dosage</Text>

        <View style={styles.field}>
          <Text style={styles.label}>How many per application</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            keyboardType="numeric"
            placeholder="0"
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldGrow]}>
            <Text style={styles.label}>Repeat every</Text>
            <TextInput
              style={styles.input}
              value={repeatEvery}
              onChangeText={setRepeatEvery}
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.field, styles.fieldFixed]}>
            <Text style={styles.label}>Unit of time</Text>
            <Pressable style={styles.dropdown}>
              <Text style={styles.dropdownText}>{unitOfTime}</Text>
              <Text style={styles.dropdownChevron}>⌄</Text>
            </Pressable>
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save medication</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const GROUPED_BACKGROUND = '#F2F2F7';
const SURFACE = '#FEF7FF';
const OUTLINE = '#79747E';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    paddingBottom: scaleHeight(40),
  },
  helperText: {
    fontSize: scaleFont(16),
    color: 'black',
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(20),
  },
  field: {
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(16),
  },
  row: {
    flexDirection: 'row',
    gap: scaleWidth(16),
  },
  fieldGrow: {
    flex: 1,
  },
  fieldFixed: {
    flex: 1,
  },
  label: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    color: 'black',
    marginBottom: scaleHeight(8),
  },
  input: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    fontSize: scaleFont(16),
    color: 'black',
  },
  dropdown: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownFull: {
    width: '100%',
  },
  dropdownText: {
    fontSize: scaleFont(16),
    color: 'black',
  },
  dropdownChevron: {
    fontSize: scaleFont(16),
    color: 'black',
  },
  saveButton: {
    marginHorizontal: scaleWidth(24),
    marginTop: scaleHeight(32),
    backgroundColor: GROUPED_BACKGROUND,
    borderRadius: scaleWidth(12),
    paddingVertical: scaleHeight(14),
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: 'black',
  },
});
