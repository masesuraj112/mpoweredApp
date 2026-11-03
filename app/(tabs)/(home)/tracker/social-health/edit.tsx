import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { socialHealthEntryToAnswers } from '@/features/assessments/savedAnswers';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { socialHealthSaveMessage } from '@/features/assessments/social-health/messages';
import { useEditSavedAnswers } from '@/features/assessments/useEditSavedAnswers';
import { getSocialHealthEntryForWeek } from '@/services/social-health';
import { router } from 'expo-router';

// The route: puts this week's saved answers back into the questions, then opens the first one.
export default function EditSocialHealthAnswers() {
  const { replaceAnswers, isHydrated } = useSocialHealthAssessment();
  const state = useEditSavedAnswers({
    load: getSocialHealthEntryForWeek,
    toAnswers: socialHealthEntryToAnswers,
    isHydrated,
    replaceAnswers,
    onReady: () => router.replace('/tracker/social-health/social-life'),
    errorMessage: socialHealthSaveMessage,
  });

  return (
    <SummaryStatus
      state={state}
      onClose={() => router.dismissTo('/home')}
      loadingLabel="Loading your answers"
    />
  );
}
