import { StyleSheet, Text } from 'react-native';

import { PlannerFlowScreen } from '@/components/care-planner/PlannerFlowScreen';
import { QuestionPreviewGroup } from '@/components/care-planner/QuestionPreviewGroup';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Colors, Spacing } from '@/constants/theme';
import { useGeneratedQuestions } from '@/features/care-planner/useGeneratedQuestions';

const SUBHEAD =
  'Based on your latest assessments, here are some questions you could ask your healthcare professional/s. To add questions to an appointment, plan an appointment.';

/** Browse the questions generated for you. It needs no appointment and nothing here can be changed. */
export default function ExploreQuestionsScreen() {
  const { state, reload } = useGeneratedQuestions();

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
            {state.data.length === 0 ? (
              <EmptyState message="There are no suggested questions yet. They appear once you have completed all of your assessments." />
            ) : (
              state.data.map((group) => <QuestionPreviewGroup key={group.groupId} group={group} />)
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
