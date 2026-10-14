import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { DateTimeField } from '@/components/care-planner/DateTimeField';
import { DateTimePickerModal } from '@/components/care-planner/DateTimePickerModal';
import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { ActionBar } from '@/components/ui/ActionBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Spacing } from '@/constants/theme';
import { formatDisplayDateTime } from '@/features/care-planner/dateTime';
import { HEALTH_SERVICE_OPTIONS } from '@/features/care-planner/healthServiceOptions';
import { useConfirmDiscard } from '@/features/care-planner/useConfirmDiscard';
import {
  MAX_PRACTITIONER_NAME_LENGTH,
  useCreateAppointment,
} from '@/features/care-planner/useCreateAppointment';

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const form = useCreateAppointment();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { dirty } = form;

  // Leaving with unsaved changes asks first (Back, hardware back and swipe back).
  useConfirmDiscard(
    dirty,
    'Discard this appointment?',
    'What you have entered has not been saved.',
  );

  // Next saves the draft (creating it the first time, updating it after that) and goes on. The
  // form stays mounted below the next screen, so going back keeps what was entered.
  const save = async () => {
    const appointment = await form.submit();
    if (appointment) {
      router.push({
        pathname: '/planner/support-person',
        params: { appointmentId: String(appointment.appointmentId) },
      });
    }
  };

  // Tell screen reader users about validation messages as they appear.
  const dateTimeError = form.errors.dateTime;
  const nameError = form.errors.practitionerName;
  useEffect(() => {
    const message = dateTimeError ?? nameError;
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [dateTimeError, nameError]);

  return (
    <PlannerFlowScreen
      title="Plan My Appointment"
      keyboardShouldPersistTaps="handled"
      footer={
        <>
          <ActionBar>
            <Button
              label={form.saving ? 'Saving…' : 'Next'}
              accessibilityLabel={form.saving ? 'Saving appointment' : 'Next'}
              variant="primary"
              disabled={form.saving}
              onPress={save}
            />
          </ActionBar>

          {pickerOpen ? (
            <DateTimePickerModal
              value={form.dateTime}
              onConfirm={(value) => {
                form.chooseDateTime(value);
                setPickerOpen(false);
              }}
              onCancel={() => setPickerOpen(false)}
            />
          ) : null}
        </>
      }>
      <Card variant="outlined" style={styles.card}>
        <DateTimeField
          label="Appointment date and time"
          placeholder="Pick appointment date and time"
          displayValue={form.dateTime ? formatDisplayDateTime(form.dateTime) : null}
          error={form.errors.dateTime}
          onPress={() => setPickerOpen(true)}
        />

        <TextField
          label="Doctor’s name"
          hint="optional"
          placeholder="Type healthcare practitioner name"
          value={form.practitionerName}
          onChangeText={form.changeName}
          maxLength={MAX_PRACTITIONER_NAME_LENGTH}
          error={form.errors.practitionerName}
        />

        <Select
          label="Health services"
          hint="optional"
          placeholder="Select healthcare practitioner service"
          options={HEALTH_SERVICE_OPTIONS}
          value={form.healthService}
          onChange={form.setHealthService}
          clearable
        />
      </Card>

      {form.saveError ? (
        <ErrorState
          message="We could not save your appointment."
          onRetry={save}
          retryLabel="Try saving again"
        />
      ) : null}
    </PlannerFlowScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
});
