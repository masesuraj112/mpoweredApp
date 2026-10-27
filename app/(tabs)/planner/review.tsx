import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { AnswerModal } from '@/components/care-planner/AnswerModal';
import { AppointmentOverviewCard } from '@/components/care-planner/AppointmentOverviewCard';
import { PlanActionBar } from '@/components/care-planner/PlanActionBar';
import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { QuestionGroupList } from '@/components/care-planner/QuestionGroupList';
import { RecordingConsentRow } from '@/components/care-planner/RecordingConsentRow';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import {
  displayOrPlaceholder,
  formatShortAppointmentDate,
  isPlanEmpty,
} from '@/features/care-planner/planDisplay';
import type { AnswerInput } from '@/features/care-planner/planTypes';
import { CONSENT_NEEDED_MESSAGE, FIRST_TIME_ANSWERS_HINT, getReviewMode } from '@/features/care-planner/reviewMode';
import { useAppointmentIdParam } from '@/features/care-planner/useAppointmentIdParam';
import { useAppointmentPlan } from '@/features/care-planner/useAppointmentPlan';
import { markAppointmentSaved, saveAnswers } from '@/services/care-planner';

export default function ReviewScreen() {
  const router = useRouter();
  const { appointmentId } = useAppointmentIdParam();
  const state = useAppointmentPlan(appointmentId);
  const { refresh } = state;

  // Consent is signed on its own screen. Re-read the plan when coming back so the tick shows.
  const firstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (firstFocus.current) {
        firstFocus.current = false;
        return;
      }
      refresh();
    }, [refresh]),
  );

  const consented = state.status === 'ready' && state.plan.recordingConsentedAt !== null;
  // A draft appointment is still being created: Save instead of Modify, and no answers yet.
  const mode = state.status === 'ready' ? getReviewMode(state.plan.appointment) : 'saved';
  const firstTime = mode === 'first-time';

  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  // Saves the new appointment and closes the whole wizard back to the planner list.
  const saveAppointment = async () => {
    setSaving(true);
    setSaveFailed(false);
    const result = await markAppointmentSaved(appointmentId);
    setSaving(false);
    if (!result.ok) {
      setSaveFailed(true);
      return;
    }
    router.dismissTo('/planner');
  };

  const openConsent = () =>
    router.push({
      pathname: '/planner/consent',
      params: { appointmentId: String(appointmentId) },
    });

  // The answer box opens over this screen on a question, so this screen stays mounted below it.
  const [answerQuestionId, setAnswerQuestionId] = useState<number | null>(null);

  // The doctor's answers can only be saved once the doctor has consented to the recording.
  const askForConsent = () =>
    Alert.alert('Consent needed first', CONSENT_NEEDED_MESSAGE, [
      { text: 'Not now', style: 'cancel' },
      { text: 'Get consent', onPress: openConsent },
    ]);

  const saveAnswersFromBox = async (answers: AnswerInput[]): Promise<boolean> => {
    const result = await saveAnswers(appointmentId, answers);
    if (result.ok) {
      refresh();
      return true;
    }
    if (result.error.code === 'CONSENT_REQUIRED') {
      // consent changed since this screen loaded: read the plan again and send them to sign
      setAnswerQuestionId(null);
      refresh();
      askForConsent();
    }
    return false;
  };

  const answerableQuestions =
    state.status === 'ready' ? state.plan.questionGroups.flatMap((group) => group.questions) : [];

  return (
    <PlannerFlowScreen
      title="Review My Appointment Plan"
      titleWeight="regular"
      footer={
        <>
          <PlanActionBar
            mode={mode}
            consented={consented}
            onSave={saveAppointment}
            saving={saving}
            onModifyQuestions={() =>
              router.push({
                pathname: '/planner/questions',
                params: { appointmentId: String(appointmentId) },
              })
            }
          />

          {!firstTime && answerQuestionId !== null && answerableQuestions.length > 0 ? (
            <AnswerModal
              questions={answerableQuestions}
              initialQuestionId={answerQuestionId}
              onSave={saveAnswersFromBox}
              onClose={() => setAnswerQuestionId(null)}
            />
          ) : null}
        </>
      }>
      {state.status === 'loading' ? <LoadingState label="Loading appointment plan" /> : null}

      {state.status === 'error' ? (
        <ErrorState message="We could not load your appointment plan." onRetry={state.reload} />
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
          {firstTime ? <Text style={styles.hint}>{FIRST_TIME_ANSWERS_HINT}</Text> : null}
          <RecordingConsentRow checked={consented} onPress={openConsent} />

          {isPlanEmpty(state.plan) ? (
            <EmptyState message="You have not added any questions for this appointment yet." />
          ) : (
            state.plan.questionGroups
              .filter((group) => group.questions.length > 0)
              .map((group) => (
                <QuestionGroupList
                  key={group.groupId}
                  group={group}
                  onEditAnswer={
                    firstTime ? undefined : consented ? setAnswerQuestionId : askForConsent
                  }
                />
              ))
          )}
        </Card>
      ) : null}

      {saveFailed ? (
        <ErrorState
          message="We could not save your appointment."
          onRetry={saveAppointment}
          retryLabel="Try saving again"
        />
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
