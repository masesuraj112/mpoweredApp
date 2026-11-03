import { SummaryReport } from '@/components/tracker/SummaryReport';
import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { MANAGEMENT_TIPS_URL } from '@/constants/managementOptions';
import { managementSaveMessage } from '@/features/assessments/management/messages';
import { toManagementSummary } from '@/features/assessments/management/summary';
import { useWeekSummary } from '@/features/assessments/useWeekSummary';
import { getManagementEntryForWeek } from '@/services/management';
import { router, useLocalSearchParams } from 'expo-router';

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const state = useWeekSummary({
    weekStart,
    load: getManagementEntryForWeek,
    toSummary: toManagementSummary,
    errorMessage: managementSaveMessage,
  });
  const close = () => router.replace('/(tabs)/home');

  if (state.status !== 'ready') return <SummaryStatus state={state} onClose={close} />;

  const { summary } = state;
  return (
    <SummaryReport
      title="My Management"
      period={summary.period}
      intro="Your answers help your doctor focus on what matters most to your daily life."
      guidance={summary.summarySentence}
      tips={{ label: 'Explore tips on managing pain', url: MANAGEMENT_TIPS_URL }}
      results={[
        { heading: 'Medication:', value: summary.medicationResult },
        { heading: 'Exercise:', value: summary.exerciseResult },
        { heading: 'Emotion:', value: summary.emotionResult },
      ]}
      // TODO: Persist this report to the My Health before showing its saved status.
      savedText="Saved to My Health"
      onClose={close}
    />
  );
}
