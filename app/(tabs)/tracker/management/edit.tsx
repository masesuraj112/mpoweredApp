import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { managementSaveMessage } from '@/features/assessments/management/messages';
import { managementEntryToAnswers } from '@/features/assessments/savedAnswers';
import { useEditSavedAnswers } from '@/features/assessments/useEditSavedAnswers';
import { getManagementEntryForWeek } from '@/services/management';
import { router } from 'expo-router';

// The route: puts this week's saved answers back into the questions, then opens the first one.
export default function EditManagementAnswers() {
  const { replaceAnswers, isHydrated } = useManagementAssessment();
  const state = useEditSavedAnswers({
    load: getManagementEntryForWeek,
    toAnswers: managementEntryToAnswers,
    isHydrated,
    replaceAnswers,
    onReady: () => router.replace('/tracker/management/medication'),
    errorMessage: managementSaveMessage,
  });

  return (
    <SummaryStatus
      state={state}
      onClose={() => router.replace('/(tabs)/home')}
      loadingLabel="Loading your answers"
    />
  );
}
