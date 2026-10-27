import { useRouter } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

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
import { needsRemovalConfirmation } from '@/features/care-planner/suggestionSelection';
import { useAppointmentIdParam } from '@/features/care-planner/useAppointmentIdParam';
import { useAppointmentQuestions } from '@/features/care-planner/useAppointmentQuestions';
import { useConfirmDiscard } from '@/features/care-planner/useConfirmDiscard';
import { formatDisplayDate, parseIsoDate } from '@/services/date';

// Wording copied exactly from the Figma design.
const SUBHEAD =
  'Based on your answers to the four impact sections, we have provided some suggested questions to ask your healthcare professional/s.';
const HINT =
  'Click the checkbox next to any questions you wish to add to your appointment plan.';

export default function QuestionsScreen() {
  const router = useRouter();
  const { appointmentId, hasAppointment } = useAppointmentIdParam();

  const questions = useAppointmentQuestions(appointmentId);
  const { load, dirty } = questions;

  // Leaving with unsaved changes asks first (Back, hardware back and swipe back).
  const allowLeave = useConfirmDiscard(
    dirty,
    'Discard changes?',
    'You have unsaved changes to your questions.',
  );

  const answeredIds = load.status === 'ready' ? load.suggestions.answeredQuestionIds : [];

  const handleToggle = (questionId: number) => {
    if (needsRemovalConfirmation(questions.selectedIds, answeredIds, questionId)) {
      Alert.alert(
        'Remove this question?',
        'This question has a doctor’s answer. Removing it will also remove the answer.',
        [
          { text: 'Keep question', style: 'cancel' },
          { text: 'Remove', style: 'destructive', onPress: () => questions.toggle(questionId) },
        ],
      );
      return;
    }
    questions.toggle(questionId);
  };

  const save = async () => {
    if (!(await questions.save())) return;
    const draft = load.status === 'ready' && load.suggestions.appointmentStatus === 'draft';
    if (draft) {
      // Still creating the appointment: carry on to review, and back returns here.
      router.push({ pathname: '/planner/review', params: { appointmentId: String(appointmentId) } });
      return;
    }
    allowLeave();
    router.back();
  };

  // The suggestions arrive ticked, so saving must work without changing a tick.
  const canSave = load.status === 'ready' && !questions.saving;

  const generatedDate =
    load.status === 'ready' ? parseIsoDate(load.suggestions.generatedOn ?? '') : null;

  return (
    <PlannerFlowScreen
      title="Add Questions for My Appointment"
      keyboardShouldPersistTaps="handled"
      footer={
        <ActionBar>
          <Button
            label={questions.saving ? 'Saving…' : 'Save'}
            accessibilityLabel={questions.saving ? 'Saving' : 'Save'}
            variant={canSave ? 'primary' : 'outlined'}
            disabled={!canSave}
            onPress={save}
          />
        </ActionBar>
      }>
      {!hasAppointment ? (
        <ErrorState message="No appointment has been chosen, so questions cannot be added yet." />
      ) : null}

      {hasAppointment && load.status === 'loading' ? (
        <LoadingState label="Loading suggested questions" />
      ) : null}

      {hasAppointment && load.status === 'error' ? (
        <ErrorState
          message="We could not load the suggested questions."
          onRetry={questions.reload}
        />
      ) : null}

      {hasAppointment && load.status === 'ready' ? (
        <>
          <Text style={styles.subhead}>{SUBHEAD}</Text>
          <QuestionHintBanner message={HINT} />

          <Card variant="outlined" style={styles.card}>
            {generatedDate ? (
              <Text style={styles.generatedOn}>
                Generated on {formatDisplayDate(generatedDate)}
              </Text>
            ) : null}
            <View style={styles.divider} />

            {load.suggestions.groups.every((group) => group.questions.length === 0) ? (
              <EmptyState message="There are no suggested questions yet." />
            ) : (
              load.suggestions.groups
                .filter((group) => group.questions.length > 0)
                .map((group) => (
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
              message="We could not save your questions."
              onRetry={save}
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
