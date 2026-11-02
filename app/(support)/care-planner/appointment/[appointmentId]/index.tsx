import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform, StyleSheet, Text } from 'react-native';

import { AnswerModal } from '@/components/care-planner/AnswerModal';
import { AppointmentOverviewCard } from '@/components/care-planner/AppointmentOverviewCard';
import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { QuestionGroupList } from '@/components/care-planner/QuestionGroupList';
import { ActionBar } from '@/components/ui/ActionBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import { carePlannerMessage } from '@/features/care-planner/messages';
import { displayOrPlaceholder, formatShortAppointmentDate, isPlanEmpty } from '@/features/care-planner/planDisplay';
import type { AnswerInput } from '@/features/care-planner/planTypes';
import { useSupportPerson } from '@/features/support-person/context';
import { canAnswerNow, getPlanAccess, isAccessChanged } from '@/features/support-person/permissions';
import { useSupportedAppointmentPlan } from '@/features/support-person/useSupportedAppointmentPlan';
import { saveSupportedAnswers } from '@/services/support-person';

/** Alert.alert does nothing on react-native-web, so fall back to the browser dialog there. */
function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
}

/**
 * A supported patient's appointment plan, laid out like the patient's "Review My Appointment Plan"
 * and built from the same components. What can be changed depends on the patient's permissions.
 */
export default function SupportedAppointmentPlanScreen() {
  // openAnswer: set by "Add doctor's answer" to open the answer box straight away.
  const params = useLocalSearchParams<{ appointmentId: string; patientId: string; openAnswer?: string }>();
  const appointmentId = Number(params.appointmentId);
  const supportPerson = useSupportPerson();
  const patient = supportPerson.getPatient(params.patientId);
  const state = useSupportedAppointmentPlan(appointmentId);
  const firstName = patient?.name.split(' ')[0] ?? 'The patient';
  const access = getPlanAccess(patient ?? { canAddQuestions: false, canAddAnswers: false });
  // Answers wait for the patient to record the doctor's consent (decision S3).
  const canAnswer = state.status === 'ready' && canAnswerNow(access, state.plan.recordingConsentedAt);
  const { refresh } = state;

  // Questions are changed on their own screen, and the patient may change the plan too. Re-read it
  // when coming back, as the patient's review screen does.
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

  // The answer box opens over this screen on a question, as on the patient's review screen.
  const [answerQuestionId, setAnswerQuestionId] = useState<number | null>(null);
  const questions = state.status === 'ready' ? state.plan.questionGroups.flatMap(group => group.questions) : [];

  // "Add doctor's answer": open the box once, on the first question without an answer.
  const openedFromButton = useRef(false);
  const firstToAnswer = (questions.find(q => q.doctorAnswer === null) ?? questions[0])?.questionId ?? null;
  useEffect(() => {
    if (!params.openAnswer || openedFromButton.current || !canAnswer || firstToAnswer === null) return;
    openedFromButton.current = true;
    setAnswerQuestionId(firstToAnswer);
  }, [params.openAnswer, canAnswer, firstToAnswer]);

  const saveAnswers = async (answers: AnswerInput[]): Promise<boolean> => {
    const result = await saveSupportedAnswers(appointmentId, answers);
    if (result.ok) {
      refresh();
      return true;
    }
    // The patient changed something under us (access, the appointment, consent): retrying won't help,
    // so close the box, say why and show what the database holds now. Anything else (for example no
    // connection) keeps the box open with its own "Try again".
    if (isAccessChanged(result.error) || result.error.code === 'CONSENT_REQUIRED') {
      setAnswerQuestionId(null);
      showMessage('Answers not saved', carePlannerMessage(result.error));
      refresh();
      if (isAccessChanged(result.error)) supportPerson.reload();
    }
    return false;
  };

  return (
    <PlannerFlowScreen
      title={patient ? `${patient.name}’s Appointment Plan` : 'Appointment Plan'}
      titleWeight="regular"
      footer={
        <>
          {access.canEditQuestions ? (
            <ActionBar>
              <Button
                label="Modify questions"
                onPress={() =>
                  router.push({
                    pathname: '/care-planner/appointment/[appointmentId]/questions',
                    params: { appointmentId: String(appointmentId), patientId: params.patientId },
                  })
                }
              />
            </ActionBar>
          ) : null}

          {canAnswer && answerQuestionId !== null && questions.length > 0 ? (
            <AnswerModal
              questions={questions}
              initialQuestionId={answerQuestionId}
              onSave={saveAnswers}
              onClose={() => setAnswerQuestionId(null)}
            />
          ) : null}
        </>
      }
    >
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
          {/* Support persons don't collect consent, so this is a status line, not the patient's checkbox.
              Without consent nobody can add the doctor's answers (decision S3). */}
          <Text style={styles.hint}>
            {state.plan.recordingConsentedAt
              ? 'Recording consent obtained.'
              : `${firstName} needs to record the doctor’s consent first.`}
          </Text>

          {isPlanEmpty(state.plan) ? (
            <EmptyState message="No questions have been added for this appointment yet." />
          ) : (
            state.plan.questionGroups
              .filter(group => group.questions.length > 0)
              .map(group => (
                <QuestionGroupList
                  key={group.groupId}
                  group={group}
                  // Without the answers permission, or before consent, the questions are read-only (no pen).
                  onEditAnswer={canAnswer ? setAnswerQuestionId : undefined}
                />
              ))
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
