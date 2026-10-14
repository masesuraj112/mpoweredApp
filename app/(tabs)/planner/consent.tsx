import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ConsentDetailField } from '@/components/care-planner/ConsentDetailField';
import { ConsentSignatureSection } from '@/components/care-planner/ConsentSignatureSection';
import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { ActionBar } from '@/components/ui/ActionBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Spacing } from '@/constants/theme';
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
    <PlannerFlowScreen
      title="Ask for Recording Consent"
      scrollEnabled={!drawing}
      footer={
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
      }>
      {plan.status === 'loading' ? <LoadingState label="Loading appointment" /> : null}

      {plan.status === 'error' ? (
        <ErrorState message="We could not load this appointment." onRetry={plan.reload} />
      ) : null}

      {plan.status === 'ready' ? (
        <Card variant="outlined" style={styles.card}>
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
    </PlannerFlowScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
});
