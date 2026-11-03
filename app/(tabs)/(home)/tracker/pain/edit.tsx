import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { painSaveMessage } from '@/features/assessments/pain/messages';
import { painEntryToAnswers } from '@/features/assessments/savedAnswers';
import { useEditSavedAnswers } from '@/features/assessments/useEditSavedAnswers';
import { getPainEntryForWeek } from '@/services/assessments';
import { router } from 'expo-router';

// The route: puts this week's saved answers back into the questions, then opens the first one.
export default function EditPainAnswers() {
  const { replaceAnswers, isHydrated } = usePainAssessment();
  const state = useEditSavedAnswers({
    load: getPainEntryForWeek,
    toAnswers: painEntryToAnswers,
    isHydrated,
    replaceAnswers,
    onReady: () => router.replace('/tracker/pain/location'),
    errorMessage: painSaveMessage,
  });

  return (
    <SummaryStatus
      state={state}
      onClose={() => router.dismissTo('/home')}
      loadingLabel="Loading your answers"
    />
  );
}
