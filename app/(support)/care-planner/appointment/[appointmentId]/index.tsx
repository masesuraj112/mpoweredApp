import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { AppointmentOverviewCard } from '@/components/care-planner/AppointmentOverviewCard';
import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { QuestionGroupList } from '@/components/care-planner/QuestionGroupList';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import { displayOrPlaceholder, formatShortAppointmentDate, isPlanEmpty } from '@/features/care-planner/planDisplay';
import { useSupportPerson } from '@/features/support-person/context';
import { useSupportedAppointmentPlan } from '@/features/support-person/useSupportedAppointmentPlan';

/**
 * A supported patient's appointment plan, laid out like the patient's "Review My Appointment Plan"
 * and built from the same components. Read-only for now.
 */
export default function SupportedAppointmentPlanScreen() {
  const params = useLocalSearchParams<{ appointmentId: string; patientId: string }>();
  const appointmentId = Number(params.appointmentId);
  const patient = useSupportPerson().getPatient(params.patientId);
  const state = useSupportedAppointmentPlan(appointmentId);
  const firstName = patient?.name.split(' ')[0] ?? 'The patient';

  return (
    <PlannerFlowScreen title={patient ? `${patient.name}’s Appointment Plan` : 'Appointment Plan'} titleWeight="regular">
      {state.status === 'loading' ? <LoadingState label="Loading appointment plan" /> : null}

      {state.status === 'error' ? (
        <ErrorState message="We could not load this appointment plan." onRetry={state.reload} />
      ) : null}

      {state.status === 'ready' ? (
        <Card variant="outlined" style={styles.card}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Appointment overview
          </Text>
          <AppointmentOverviewCard
            dateText={displayOrPlaceholder(formatShortAppointmentDate(state.plan.appointment.dateTime))}
            doctorName={displayOrPlaceholder(state.plan.appointment.practitionerName)}
            healthService={displayOrPlaceholder(state.plan.appointment.healthService)}
            supportPerson={displayOrPlaceholder(state.plan.supportPersonName)}
          />

          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Questions to ask
          </Text>
          {/* Support persons don't collect consent for now, so this is a status line, not the patient's checkbox. */}
          <Text style={styles.hint}>
            {state.plan.recordingConsentedAt
              ? 'Recording consent obtained.'
              : `Recording consent not obtained yet. Only ${firstName} can ask the doctor for it.`}
          </Text>

          {isPlanEmpty(state.plan) ? (
            <EmptyState message="No questions have been added for this appointment yet." />
          ) : (
            state.plan.questionGroups
              .filter(group => group.questions.length > 0)
              .map(group => <QuestionGroupList key={group.groupId} group={group} />)
          )}
        </Card>
      ) : null}
    </PlannerFlowScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.4,
    color: Colors.light.onSurfaceVariant,
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
});
