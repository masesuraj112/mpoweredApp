import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { AccessibilityInfo, StyleSheet } from 'react-native';

import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { QuestionHintBanner } from '@/components/care-planner/QuestionHintBanner';
import { SupportPersonForm } from '@/components/care-planner/SupportPersonForm';
import { SupportPersonList } from '@/components/care-planner/SupportPersonList';
import { ActionBar } from '@/components/ui/ActionBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Spacing } from '@/constants/theme';
import { useAppointmentIdParam } from '@/features/care-planner/useAppointmentIdParam';
import { useConfirmDiscard } from '@/features/care-planner/useConfirmDiscard';
import { useSupportPerson } from '@/features/care-planner/useSupportPerson';

// Wording copied exactly from the Figma design.
const INTRO =
  'You can nominate someone to help you prepare for your appointment or you can skip below.';

export default function SupportPersonScreen() {
  const router = useRouter();
  const { appointmentId } = useAppointmentIdParam();
  const form = useSupportPerson(appointmentId);
  const { dirty } = form;

  // Leaving with unsaved changes asks first (Back, hardware back and swipe back).
  useConfirmDiscard(
    dirty,
    'Discard this support person?',
    'What you have entered has not been saved.',
  );

  const goToQuestions = () =>
    router.push({
      pathname: '/planner/questions',
      params: { appointmentId: String(appointmentId) },
    });

  const save = async () => {
    if (await form.save()) goToQuestions();
  };

  const skip = async () => {
    if (await form.skip()) goToQuestions();
  };

  // Tell screen reader users about validation messages as they appear.
  const message = form.errors.name ?? form.errors.phone ?? form.errors.email;
  useEffect(() => {
    if (message) AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  return (
    <PlannerFlowScreen
      title="Add a Support Person"
      keyboardShouldPersistTaps="handled"
      footer={
        <ActionBar layout="pair">
          <Button label="Skip" variant="outlined" disabled={form.saving} onPress={skip} />
          <Button
            label={form.saving ? 'Saving…' : 'Save'}
            accessibilityLabel={form.saving ? 'Saving support person' : 'Save'}
            variant="primary"
            disabled={form.saving}
            onPress={save}
          />
        </ActionBar>
      }>
      <QuestionHintBanner message={INTRO} />

      {form.loadStatus === 'loading' ? <LoadingState label="Loading support people" /> : null}

      {form.loadStatus === 'error' ? (
        <ErrorState message="We could not load the support people." onRetry={form.reload} />
      ) : null}

      {form.loadStatus === 'ready' ? (
        <>
          <SupportPersonList people={form.people} onRemove={form.removePerson} />

          <Card variant="outlined" style={styles.card}>
            <SupportPersonForm
              draft={form.draft}
              errors={form.errors}
              onChange={form.updateDraft}
              onBlurField={form.blurField}
            />
            <Button
              label="Add another person"
              variant="elevated"
              disabled={form.saving}
              onPress={form.addAnother}
              style={styles.addAnother}
            />
          </Card>
        </>
      ) : null}

      {form.saveError ? (
        <ErrorState
          message="We could not save the support person."
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
  addAnother: {
    alignSelf: 'stretch',
  },
});
