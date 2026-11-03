import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { movementEntryToAnswers } from '@/features/assessments/savedAnswers';
import { useEditSavedAnswers } from '@/features/assessments/useEditSavedAnswers';
import { getMovementEntryForWeek } from '@/services/assessments';
import { router } from 'expo-router';

// The route: puts this week's saved answers back into the questions, then opens the first one.
export default function EditMovementAnswers() {
  const { replaceAnswers, isHydrated } = useMovementAssessment();
  const state = useEditSavedAnswers({
    load: getMovementEntryForWeek,
    toAnswers: movementEntryToAnswers,
    isHydrated,
    replaceAnswers,
    onReady: () => router.replace('/tracker/movement/activity'),
    errorMessage: (error) => assessmentSaveMessage(error, 'movement'),
  });

  return (
    <SummaryStatus
      state={state}
      onClose={() => router.replace('/(tabs)/home')}
      loadingLabel="Loading your answers"
    />
  );
}
