import { useNavigation, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateTimeField } from '@/components/care-planner/DateTimeField';
import { DateTimePickerModal } from '@/components/care-planner/DateTimePickerModal';
import { ActionBar } from '@/components/ui/ActionBar';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { Select } from '@/components/ui/Select';
import { TextField } from '@/components/ui/TextField';
import { Colors, Spacing } from '@/constants/theme';
import { formatDisplayDateTime } from '@/features/care-planner/dateTime';
import { HEALTH_SERVICE_OPTIONS } from '@/features/care-planner/healthServiceOptions';
import {
  MAX_PRACTITIONER_NAME_LENGTH,
  useCreateAppointment,
} from '@/features/care-planner/useCreateAppointment';

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const form = useCreateAppointment();
  const [pickerOpen, setPickerOpen] = useState(false);
  const { dirty } = form;

  // Leaving with something entered asks first (Back, hardware back and swipe back).
  const leaveAllowed = useRef(false);
  useEffect(() => {
    return navigation.addListener('beforeRemove', (event) => {
      if (leaveAllowed.current || !dirty) return;
      event.preventDefault();
      Alert.alert('Discard this appointment?', 'What you have entered has not been saved.', [
        { text: 'Keep editing', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            leaveAllowed.current = true;
            navigation.dispatch(event.data.action);
          },
        },
      ]);
    });
  }, [navigation, dirty]);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Plan My Appointment
        </Text>

        <Card style={styles.card}>
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
      </ScrollView>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  topBar: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  card: {
    gap: Spacing.four,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
  },
});
