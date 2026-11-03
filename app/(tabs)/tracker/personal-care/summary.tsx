import { ReportSection } from '@/components/tracker/ReportSection';
import { SummaryReport } from '@/components/tracker/SummaryReport';
import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { AppText } from '@/components/ui/AppText';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { toPersonalCareSummary } from '@/features/assessments/personal-care/summary';
import { useWeekSummary } from '@/features/assessments/useWeekSummary';
import { getPersonalCareEntryForWeek } from '@/services/assessments';
import { router, useLocalSearchParams } from 'expo-router';

const DAILY_LIVING_TIPS_URL = 'https://muscha.org/living-well-with-a-musculoskeletal-condition';

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const state = useWeekSummary({
    weekStart,
    load: getPersonalCareEntryForWeek,
    toSummary: toPersonalCareSummary,
    errorMessage: (error) => assessmentSaveMessage(error, 'personal care'),
  });
  const close = () => router.replace('/(tabs)/home');

  if (state.status !== 'ready') return <SummaryStatus state={state} onClose={close} />;

  const { summary } = state;
  return (
    <SummaryReport
      title="My Personal Care"
      period={summary.period}
      intro="This helps guide your treatment and support your recovery."
      guidance={summary.message}
      tips={{ label: 'Explore tips on daily living', url: DAILY_LIVING_TIPS_URL }}
      results={[
        {
          heading: 'General Activities:',
          value: summary.generalActivities.join(', ') || 'No activities selected.',
        },
        {
          heading: 'Personal care (washing, dressing, etc)',
          value: summary.personalCareLevel || 'No response recorded.',
        },
        { heading: 'Sleeping:', value: summary.sleepingLevel || 'No response recorded.' },
      ]}
      savedText="Saved to Care Journal"
      onClose={close}>
      <ReportSection heading="My reflections:">
        <AppText variant="bodyMediumRegular" color="onSurface">
          {summary.reflection || 'No reflections added.'}
        </AppText>
      </ReportSection>
    </SummaryReport>
  );
}
