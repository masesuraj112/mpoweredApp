import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from '@/components/mpowered/Dropdown';
import { PrescriptionsHeader } from '@/components/mpowered/PrescriptionsHeader';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

const STRENGTH_UNITS = ['mg', 'g', '%', 'iu', 'ug'] as const;
type StrengthUnit = (typeof STRENGTH_UNITS)[number];

// Plural value -> singular label, used when the quantity is exactly 1
const FORMS = {
  tablets: 'tablet',
  capsules: 'capsule',
  liquids: 'liquid',
  drops: 'drop',
  injections: 'injection',
  sprays: 'spray',
  ml: 'ml',
  patches: 'patch',
} as const;
type Form = keyof typeof FORMS;

const UNITS_OF_TIME = {
  hours: 'hour',
  days: 'day',
  weeks: 'week',
  months: 'month',
} as const;
type UnitOfTime = keyof typeof UNITS_OF_TIME;

function pluralOptions<T extends string>(singulars: Record<T, string>, quantity: string) {
  const isSingular = Number(quantity) === 1;
  return (Object.keys(singulars) as T[]).map((value) => ({
    value,
    label: isSingular ? singulars[value] : value,
  }));
}

export default function AddPrescriptionScreen() {
  // Present when opened from the edit button on the prescriptions list
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [medicationName, setMedicationName] = useState('');
  const [strength, setStrength] = useState('');
  const [dosage, setDosage] = useState('');
  const [repeatEvery, setRepeatEvery] = useState('1');

  const [strengthUnit, setStrengthUnit] = useState<StrengthUnit>('mg');
  const [form, setForm] = useState<Form>('tablets');
  const [unitOfTime, setUnitOfTime] = useState<UnitOfTime>('days');

  const strengthUnitOptions = STRENGTH_UNITS.map((unit) => ({ value: unit, label: unit }));
  const formOptions = pluralOptions(FORMS, dosage);
  const unitOfTimeOptions = pluralOptions(UNITS_OF_TIME, repeatEvery);

  // TODO: when editing, load the existing prescription from Supabase and prefill the fields above, e.g.
  // supabase.from('prescriptions').select('*').eq('id', id).single()

  const handleSave = () => {
    // TODO: update the existing row when isEditing instead of inserting
    // TODO: persist to Supabase once prescriptions are wired up, e.g.
    // supabase.from('prescriptions').insert({ medicationName, strength, strengthUnit, form, dosage, repeatEvery, unitOfTime, users_id: userId })
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <PrescriptionsHeader title={isEditing ? 'Edit prescription' : 'Add prescription'} />

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
            <Dropdown
              value={strengthUnit}
              options={strengthUnitOptions}
              onChange={setStrengthUnit}
              accessibilityLabel="Strength unit"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Form</Text>
          <Dropdown
            value={form}
            options={formOptions}
            onChange={setForm}
            accessibilityLabel="Form"
          />
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
            <Dropdown
              value={unitOfTime}
              options={unitOfTimeOptions}
              onChange={setUnitOfTime}
              accessibilityLabel="Unit of time"
            />
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{isEditing ? 'Save changes' : 'Save medication'}</Text>
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
