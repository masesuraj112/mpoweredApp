import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from '@/components/mpowered/Dropdown';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { PrescriptionsHeader } from '@/components/mpowered/PrescriptionsHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import {
  FORMS,
  STRENGTH_UNITS,
  UNITS_OF_TIME,
  prescriptionErrorMessage,
  toPrescriptionForm,
  validatePrescription,
  type PrescriptionForm,
} from '@/features/health-profile/prescriptions';
import { getPrescription, savePrescription } from '@/services/health';

import { ContentColumn, makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
function pluralOptions<T extends string>(singulars: Record<T, string>, quantity: string) {
  const isSingular = Number(quantity) === 1;
  return (Object.keys(singulars) as T[]).map((value) => ({
    value,
    label: isSingular ? singulars[value] : value,
  }));
}

const EMPTY_FORM: PrescriptionForm = {
  name: '',
  strength: '',
  strengthUnit: 'mg',
  form: 'tablets',
  amount: '',
  repeatsEvery: '1',
  unitOfTime: 'days',
};

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready' };

export default function AddPrescriptionScreen() {
  const styles = useStyles();
  // Present when opened from the edit button on the prescriptions list
  const { id: idParam } = useLocalSearchParams<{ id?: string }>();
  const id = idParam ? Number(idParam) : undefined;
  const isEditing = id !== undefined;

  const [values, setValues] = useState<PrescriptionForm>(EMPTY_FORM);
  const [loadState, setLoadState] = useState<LoadState>(
    isEditing ? { status: 'loading' } : { status: 'ready' },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<{ message: string; field?: string } | null>(null);
  // The iOS number keyboard has no return key, so the number fields share a Done bar to close it.
  const doneBar = useKeyboardDoneBar();

  const setField = <K extends keyof PrescriptionForm>(key: K) => (value: PrescriptionForm[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const strengthUnitOptions = STRENGTH_UNITS.map((unit) => ({ value: unit, label: unit }));
  const formOptions = pluralOptions(FORMS, values.amount);
  const unitOfTimeOptions = pluralOptions(UNITS_OF_TIME, values.repeatsEvery);

  const isValidId = id === undefined || (Number.isInteger(id) && id > 0);

  useEffect(() => {
    if (id === undefined || !isValidId) return;
    let cancelled = false;
    getPrescription(id).then((result) => {
      if (cancelled) return;
      if (!result.ok) {
        setLoadState({ status: 'error', message: prescriptionErrorMessage(result.error) });
        return;
      }
      setValues(toPrescriptionForm(result.data));
      setLoadState({ status: 'ready' });
    });
    return () => {
      cancelled = true;
    };
  }, [id, isValidId]);

  const handleSave = async () => {
    if (saving) return;
    const validated = validatePrescription(values);
    if (!validated.ok) {
      setError({ message: validated.error.message, field: validated.error.field });
      return;
    }
    setError(null);
    setSaving(true);
    const result = await savePrescription(validated.data, id);
    setSaving(false);
    if (!result.ok) {
      setError({ message: prescriptionErrorMessage(result.error), field: result.error.field });
      return;
    }
    router.back();
  };

  const errorFor = (field: keyof PrescriptionForm) =>
    error?.field === field ? <Text style={styles.fieldError}>{error.message}</Text> : null;
  const inputStyle = (field: keyof PrescriptionForm) => [
    styles.input,
    error?.field === field && styles.inputError,
  ];

  if (!isValidId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <PrescriptionsHeader title="Edit prescription" />
        <ErrorState message="We could not find this prescription." />
      </SafeAreaView>
    );
  }

  if (loadState.status !== 'ready') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <PrescriptionsHeader title="Edit prescription" />
        {loadState.status === 'loading' ? (
          <LoadingState label="Loading prescription" />
        ) : (
          <ErrorState message={loadState.message} />
        )}
      </SafeAreaView>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.safeArea}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic">
        <PrescriptionsHeader title={isEditing ? 'Edit prescription' : 'Add prescription'} />

        <Text style={styles.helperText}>Type the name of your medication</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Medication name</Text>
          <TextInput
            style={inputStyle('name')}
            value={values.name}
            onChangeText={setField('name')}
            placeholder="e.g. Perindopril arginine"
            maxLength={100}
          />
          {errorFor('name')}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldGrow]}>
            <Text style={styles.label}>Strength</Text>
            <TextInput
              style={inputStyle('strength')}
              value={values.strength}
              onChangeText={setField('strength')}
              keyboardType="decimal-pad"
              inputAccessoryViewID={doneBar.id}
              placeholder="0"
            />
            {errorFor('strength')}
          </View>
          <View style={[styles.field, styles.fieldFixed]}>
            <Text style={styles.label}>Strength unit</Text>
            <Dropdown
              value={values.strengthUnit}
              options={strengthUnitOptions}
              onChange={setField('strengthUnit')}
              accessibilityLabel="Strength unit"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Form</Text>
          <Dropdown
            value={values.form}
            options={formOptions}
            onChange={setField('form')}
            accessibilityLabel="Form"
          />
        </View>

        <Text style={styles.helperText}>Dosage</Text>

        <View style={styles.field}>
          <Text style={styles.label}>How many per application</Text>
          <TextInput
            style={inputStyle('amount')}
            value={values.amount}
            onChangeText={setField('amount')}
            keyboardType="decimal-pad"
            inputAccessoryViewID={doneBar.id}
            placeholder="0"
          />
          {errorFor('amount')}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.fieldGrow]}>
            <Text style={styles.label}>Repeat every</Text>
            <TextInput
              style={inputStyle('repeatsEvery')}
              value={values.repeatsEvery}
              onChangeText={setField('repeatsEvery')}
              keyboardType="number-pad"
              inputAccessoryViewID={doneBar.id}
            />
            {errorFor('repeatsEvery')}
          </View>
          <View style={[styles.field, styles.fieldFixed]}>
            <Text style={styles.label}>Unit of time</Text>
            <Dropdown
              value={values.unitOfTime}
              options={unitOfTimeOptions}
              onChange={setField('unitOfTime')}
              accessibilityLabel="Unit of time"
            />
          </View>
        </View>

        {error && !error.field && (
          <Text style={[styles.fieldError, styles.formError]} accessibilityRole="alert">
            {error.message}
          </Text>
        )}

        <Pressable
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          accessibilityRole="button"
          accessibilityState={{ disabled: saving, busy: saving }}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Save medication'}
          </Text>
        </Pressable>
      </ScrollView>
      {doneBar.bar}
    </>
  );
}


const useStyles = makeStyles((colors) => ({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    ...ContentColumn,
    paddingBottom: Spacing.five,
  },
  helperText: {
    ...Typography.bodyLarge,
    color: colors.text,
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  field: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  fieldGrow: {
    flex: 1,
  },
  fieldFixed: {
    flex: 1,
  },
  label: {
    ...Typography.caption,
    fontWeight: '500',
    color: colors.text,
    marginBottom: Spacing.two,
  },
  input: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    ...Typography.bodyLarge,
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
  },
  saveButton: {
    marginTop: Spacing.five,
    backgroundColor: colors.background,
    alignItems: 'center',
    minHeight: MinTapTarget,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    ...Typography.caption,
    color: colors.error,
    marginTop: Spacing.one,
  },
  formError: {
    marginHorizontal: Spacing.four,
    marginTop: Spacing.three,
  },
  saveButtonText: {
    ...Typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
}));
