import { useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';

import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { QuestionPreviewGroup } from '@/components/care-planner/QuestionPreviewGroup';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import { missingAssessmentsMessage } from '@/features/care-planner/messages';
import { useGeneratedQuestions } from '@/features/care-planner/useGeneratedQuestions';

const SUBHEAD =
  'Based on your latest assessments, here are some questions you could ask your healthcare professional/s. To add questions to an appointment, plan an appointment.';

/** Browse the questions generated for you. It needs no appointment and nothing here can be changed. */
export default function ExploreQuestionsScreen() {
  const { state, reload, refresh } = useGeneratedQuestions();

  // Assessments are completed on other screens. Read again when coming back, so the list is not stale.
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

  return (
    <PlannerFlowScreen title="Questions Generated for Me">
      {state.status === 'loading' ? <LoadingState label="Loading suggested questions" /> : null}

      {state.status === 'error' ? (
        <ErrorState message="We could not load the suggested questions." onRetry={reload} />
      ) : null}

      {state.status === 'ready' ? (
        <>
          <Text style={styles.subhead}>{SUBHEAD}</Text>
          <Card variant="outlined" style={styles.card}>
            {state.data.groups.length === 0 ? (
              <EmptyState message={missingAssessmentsMessage(state.data.missing)} />
            ) : (
              state.data.groups.map((group) => <QuestionPreviewGroup key={group.groupId} group={group} />)
            )}
          </Card>
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
});
