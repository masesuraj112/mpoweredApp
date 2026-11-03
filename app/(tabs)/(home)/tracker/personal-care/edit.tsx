import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { personalCareEntryToAnswers } from '@/features/assessments/savedAnswers';
import { useEditSavedAnswers } from '@/features/assessments/useEditSavedAnswers';
import { getPersonalCareEntryForWeek } from '@/services/assessments';
import { router } from 'expo-router';

// The route: puts this week's saved answers back into the questions, then opens the first one.
export default function EditPersonalCareAnswers() {
  const { replaceAnswers, isHydrated } = usePersonalCareAssessment();
  const state = useEditSavedAnswers({
    load: getPersonalCareEntryForWeek,
    toAnswers: personalCareEntryToAnswers,
    isHydrated,
    replaceAnswers,
    onReady: () => router.replace('/tracker/personal-care/general'),
    errorMessage: (error) => assessmentSaveMessage(error, 'personal care'),
  });

  return (
    <SummaryStatus
      state={state}
      onClose={() => router.dismissTo('/home')}
      loadingLabel="Loading your answers"
    />
  );
}
