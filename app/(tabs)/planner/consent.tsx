import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConsentDetailField } from '@/components/care-planner/ConsentDetailField';
import { ConsentSignatureSection } from '@/components/care-planner/ConsentSignatureSection';
import { ActionBar } from '@/components/ui/ActionBar';
import { BackButton } from '@/components/ui/BackButton';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import { formatAppointmentDate } from '@/features/care-planner/appointmentDisplay';
import { displayOrPlaceholder } from '@/features/care-planner/planDisplay';
import { useAppointmentIdParam } from '@/features/care-planner/useAppointmentIdParam';
import { useAppointmentPlan } from '@/features/care-planner/useAppointmentPlan';
import { useRecordingConsent } from '@/features/care-planner/useRecordingConsent';

export default function ConsentScreen() {
  const router = useRouter();
  const { appointmentId } = useAppointmentIdParam();

  const plan = useAppointmentPlan(appointmentId);
  const consent = useRecordingConsent(appointmentId);
  // Strokes must never scroll the page, so scrolling is off while a finger is on the pad.
  const [drawing, setDrawing] = useState(false);

  const saving = consent.status === 'saving';
  const canSave = plan.status === 'ready' && consent.canSubmit;

  const save = async () => {
    if (await consent.submit()) router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.topBar}>
        <BackButton onPress={() => router.back()} />
      </View>

      <ScrollView scrollEnabled={!drawing} contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Ask for Recording Consent
        </Text>

        {plan.status === 'loading' ? <LoadingState label="Loading appointment" /> : null}

        {plan.status === 'error' ? (
          <ErrorState message="We could not load this appointment." onRetry={plan.reload} />
        ) : null}

        {plan.status === 'ready' ? (
          <Card style={styles.card}>
            <ConsentDetailField
              label="Appointment date"
              value={displayOrPlaceholder(formatAppointmentDate(plan.plan.appointment.dateTime))}
            />
            <ConsentDetailField
              label="Doctor’s name"
              value={displayOrPlaceholder(plan.plan.appointment.practitionerName)}
            />
            <ConsentDetailField
              label="Health services"
              value={displayOrPlaceholder(plan.plan.appointment.healthService)}
            />
            <ConsentSignatureSection
              signature={consent.signature}
              onChange={consent.changeSignature}
              onDrawStart={() => setDrawing(true)}
              onDrawEnd={() => setDrawing(false)}
              disabled={saving}
            />
          </Card>
        ) : null}

        {consent.status === 'error' ? (
          <ErrorState
            message="We could not save the consent."
            onRetry={save}
            retryLabel="Try saving again"
          />
        ) : null}
      </ScrollView>

      <ActionBar>
        <Button
          label={saving ? 'Saving…' : 'Save'}
          accessibilityLabel={saving ? 'Saving' : 'Save'}
          variant={canSave ? 'primary' : 'outlined'}
          disabled={!canSave}
          accessibilityHint={canSave || saving ? undefined : 'Draw a signature to enable'}
          onPress={save}
        />
      </ActionBar>
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
