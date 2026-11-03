import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Dropdown } from '@/components/health/Dropdown';
import { HealthSubpage } from '@/components/health/HealthSubpage';
import { PrescriptionsHeader } from '@/components/health/PrescriptionsHeader';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
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

/** A label above a control that has no label of its own (the dropdowns). */
function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.dropdownField}>
      <AppText variant="labelLarge" color="onSurface">
        {label}
      </AppText>
      {children}
    </View>
  );
}

export default function AddPrescriptionScreen() {
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

  const errorFor = (field: keyof PrescriptionForm) => (error?.field === field ? error.message : null);

  if (!isValidId) {
    return (
      <HealthSubpage header={<PrescriptionsHeader title="Edit prescription" />}>
        <ErrorState message="We could not find this prescription." />
      </HealthSubpage>
    );
  }

  if (loadState.status !== 'ready') {
    return (
      <HealthSubpage header={<PrescriptionsHeader title="Edit prescription" />}>
        {loadState.status === 'loading' ? (
          <LoadingState label="Loading prescription" />
        ) : (
          <ErrorState message={loadState.message} />
        )}
      </HealthSubpage>
    );
  }

  return (
    <HealthSubpage
      header={<PrescriptionsHeader title={isEditing ? 'Edit prescription' : 'Add prescription'} />}
    >
      <View style={styles.form}>
        <AppText variant="bodyLarge">Type the name of your medication</AppText>

        <TextField
          label="Medication name"
          value={values.name}
          onChangeText={setField('name')}
          placeholder="e.g. Perindopril arginine"
          maxLength={100}
          error={errorFor('name')}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="Strength"
              value={values.strength}
              onChangeText={setField('strength')}
              keyboardType="decimal-pad"
              autoCapitalize="none"
              inputAccessoryViewID={doneBar.id}
              placeholder="0"
              error={errorFor('strength')}
            />
          </View>
          <View style={styles.rowItem}>
            <LabeledField label="Strength unit">
              <Dropdown
                value={values.strengthUnit}
                options={strengthUnitOptions}
                onChange={setField('strengthUnit')}
                accessibilityLabel="Strength unit"
              />
            </LabeledField>
          </View>
        </View>

        <LabeledField label="Form">
          <Dropdown
            value={values.form}
            options={formOptions}
            onChange={setField('form')}
            accessibilityLabel="Form"
          />
        </LabeledField>

        <AppText variant="bodyLarge">Dosage</AppText>

        <TextField
          label="How many per application"
          value={values.amount}
          onChangeText={setField('amount')}
          keyboardType="decimal-pad"
          autoCapitalize="none"
          inputAccessoryViewID={doneBar.id}
          placeholder="0"
          error={errorFor('amount')}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="Repeat every"
              value={values.repeatsEvery}
              onChangeText={setField('repeatsEvery')}
              keyboardType="number-pad"
              autoCapitalize="none"
              inputAccessoryViewID={doneBar.id}
              error={errorFor('repeatsEvery')}
            />
          </View>
          <View style={styles.rowItem}>
            <LabeledField label="Unit of time">
              <Dropdown
                value={values.unitOfTime}
                options={unitOfTimeOptions}
                onChange={setField('unitOfTime')}
                accessibilityLabel="Unit of time"
              />
            </LabeledField>
          </View>
        </View>

        {error && !error.field && (
          <AppText accessibilityRole="alert" variant="bodySmall" color="error">
            {error.message}
          </AppText>
        )}

        <Button
          label={saving ? 'Saving…' : isEditing ? 'Save changes' : 'Save medication'}
          variant="primary"
          disabled={saving}
          onPress={handleSave}
        />
      </View>
      {doneBar.bar}
    </HealthSubpage>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  rowItem: {
    flex: 1,
  },
  dropdownField: {
    gap: Spacing.one,
  },
});
