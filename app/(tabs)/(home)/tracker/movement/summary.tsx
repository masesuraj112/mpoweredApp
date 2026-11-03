import { ReportSection } from '@/components/tracker/ReportSection';
import { SummaryReport } from '@/components/tracker/SummaryReport';
import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { AppText } from '@/components/ui/AppText';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { toMovementSummary } from '@/features/assessments/movement/summary';
import { useWeekSummary } from '@/features/assessments/useWeekSummary';
import { getMovementEntryForWeek } from '@/services/assessments';
import { router, useLocalSearchParams } from 'expo-router';

const EXERCISE_INFO_URL = 'https://muscha.org/exercise';

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const state = useWeekSummary({
    weekStart,
    load: getMovementEntryForWeek,
    toSummary: toMovementSummary,
    errorMessage: (error) => assessmentSaveMessage(error, 'movement'),
  });
  const close = () => router.dismissTo('/home');

  if (state.status !== 'ready') return <SummaryStatus state={state} onClose={close} />;

  const { summary } = state;
  return (
    <SummaryReport
      title="My Movement"
      period={summary.period}
      intro="This helps guide your treatment and support your recovery."
      guidance={summary.message}
      tips={{ label: 'Explore tips on managing movement', url: EXERCISE_INFO_URL }}
      results={[
        {
          heading: 'Average activity hour:',
          value: `Last week, I was able to stay active for approximately ${summary.activeHours} hours`,
        },
        {
          heading: 'General Movement:',
          value:
            summary.generalImpacts.length > 0
              ? summary.generalImpacts.join(' ')
              : 'No impacts reported this week.',
        },
        { heading: 'Walking:', value: summary.walking || 'No response recorded.' },
        { heading: 'Lifting:', value: summary.lifting || 'No response recorded.' },
        { heading: 'Sitting:', value: summary.sitting || 'No response recorded.' },
        { heading: 'Standing:', value: summary.standing || 'No response recorded.' },
      ]}
      // TODO: Persist this report to the My Health before showing its saved status.
      savedText="Saved to My Health"
      onClose={close}>
      <ReportSection heading="My reflections:">
        <AppText variant="bodyMediumRegular" color="onSurface">
          {summary.reflection || 'No reflection recorded.'}
        </AppText>
      </ReportSection>
    </SummaryReport>
  );
}
