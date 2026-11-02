import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Alert, Platform, StyleSheet, Text, View } from 'react-native';

import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { QuestionHintBanner } from '@/components/care-planner/QuestionHintBanner';
import { QuestionSuggestionGroup } from '@/components/care-planner/QuestionSuggestionGroup';
import { ActionBar } from '@/components/ui/ActionBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import { carePlannerMessage } from '@/features/care-planner/messages';
import { useConfirmDiscard } from '@/features/care-planner/useConfirmDiscard';
import { useSupportPerson } from '@/features/support-person/context';
import { getPlanAccess, isAccessChanged } from '@/features/support-person/permissions';
import { useSupportedAppointmentQuestions } from '@/features/support-person/useSupportedAppointmentQuestions';
import { formatDisplayDate, parseIsoDate } from '@/services/date';

const HINT = 'Click the checkbox next to any questions you wish to add to the appointment plan.';

/** Alert.alert does nothing on react-native-web, so fall back to the browser dialogs there. */
function showMessage(title: string, message: string) {
  if (Platform.OS === 'web') window.alert(`${title}\n${message}`);
  else Alert.alert(title, message);
}

/**
 * Choose which suggested questions are on a supported patient's appointment plan. Laid out like the
 * patient's "Add Questions for My Appointment", and only for support persons with "Add questions".
 */
export default function SupportedQuestionsScreen() {
  const params = useLocalSearchParams<{ appointmentId: string; patientId: string }>();
  const appointmentId = Number(params.appointmentId);
  const supportPerson = useSupportPerson();
  const patient = supportPerson.getPatient(params.patientId);
  const access = getPlanAccess(patient ?? { canAddQuestions: false, canAddAnswers: false });
  const firstName = patient?.name.split(' ')[0] ?? 'the patient';

  const questions = useSupportedAppointmentQuestions(appointmentId, access.canEditAnswers);
  const { load, dirty } = questions;

  // Leaving with unsaved changes asks first (Back, hardware back and swipe back).
  const allowLeave = useConfirmDiscard(dirty, 'Discard changes?', 'You have unsaved changes to the questions.');

  const handleToggle = (questionId: number) => {
    const rule = questions.tapRule(questionId);
    if (rule === 'blocked') {
      showMessage(
        'This question has a doctor’s answer',
        `Removing it would also remove the answer, and only ${firstName} or someone allowed to add doctor’s answers can do that.`,
      );
      return;
    }
    if (rule === 'confirm') {
      const message = 'This question has a doctor’s answer. Removing it will also remove the answer.';
      if (Platform.OS === 'web') {
        if (window.confirm(message)) questions.toggle(questionId);
        return;
      }
      Alert.alert('Remove this question?', message, [
        { text: 'Keep question', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => questions.toggle(questionId) },
      ]);
      return;
    }
    questions.toggle(questionId);
  };

  // A save refused because the patient changed this person's access, or took them off the
  // appointment: the patient list is stale, so read it again.
  const { saveError } = questions;
  const { reload: reloadPatients } = supportPerson;
  useEffect(() => {
    if (saveError && isAccessChanged(saveError)) reloadPatients();
  }, [saveError, reloadPatients]);

  const save = async () => {
    if (!(await questions.save())) return;
    allowLeave();
    router.back();
  };

  const canSave = access.canEditQuestions && load.status === 'ready' && !questions.saving;
  const generatedDate = load.status === 'ready' ? parseIsoDate(load.suggestions.generatedOn ?? '') : null;

  return (
    <PlannerFlowScreen
      title={patient ? `Add Questions for ${patient.name}’s Appointment` : 'Add Questions'}
      keyboardShouldPersistTaps="handled"
      footer={
        access.canEditQuestions ? (
          <ActionBar>
            <Button
              label={questions.saving ? 'Saving…' : 'Save'}
              accessibilityLabel={questions.saving ? 'Saving' : 'Save'}
              variant={canSave ? 'primary' : 'outlined'}
              disabled={!canSave}
              onPress={save}
            />
          </ActionBar>
        ) : null
      }
    >
      {!access.canEditQuestions ? (
        <ErrorState message={`You don’t have permission to add questions for ${firstName}.`} />
      ) : null}

      {access.canEditQuestions && load.status === 'loading' ? <LoadingState label="Loading suggested questions" /> : null}

      {access.canEditQuestions && load.status === 'error' ? (
        <ErrorState message="We could not load the suggested questions." onRetry={questions.reload} />
      ) : null}

      {access.canEditQuestions && load.status === 'ready' ? (
        <>
          <Text style={styles.subhead}>
            {`Based on ${firstName}’s answers to the four impact sections, these are suggested questions to ask their healthcare professional/s.`}
          </Text>
          <QuestionHintBanner message={HINT} />

          <Card variant="outlined" style={styles.card}>
            {generatedDate ? (
              <Text style={styles.generatedOn}>Generated on {formatDisplayDate(generatedDate)}</Text>
            ) : null}
            <View style={styles.divider} />

            {load.suggestions.groups.every(group => group.questions.length === 0) ? (
              <EmptyState message="There are no suggested questions yet." />
            ) : (
              load.suggestions.groups
                .filter(group => group.questions.length > 0)
                .map(group => (
                  <QuestionSuggestionGroup
                    key={group.groupId}
                    group={group}
                    selectedIds={questions.selectedIds}
                    onToggle={handleToggle}
                  />
                ))
            )}
          </Card>

          {questions.saveError ? (
            <ErrorState
              message={carePlannerMessage(questions.saveError)}
              onRetry={isAccessChanged(questions.saveError) ? undefined : save}
              retryLabel="Try saving again"
            />
          ) : null}
        </>
      ) : null}
    </PlannerFlowScreen>
  );
}

const styles = StyleSheet.create({
  subhead: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
    color: Colors.light.onSurface,
  },
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  generatedOn: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.outline,
  },
});
