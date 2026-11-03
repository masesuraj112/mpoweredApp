import { ReportSection } from '@/components/tracker/ReportSection';
import { ResultSection } from '@/components/tracker/ResultSection';
import { SummaryReport } from '@/components/tracker/SummaryReport';
import { SummaryStatus } from '@/components/tracker/SummaryStatus';
import { AppText } from '@/components/ui/AppText';
import { TIPS_URL } from '@/constants/socialHealthOptions';
import { socialHealthSaveMessage } from '@/features/assessments/social-health/messages';
import { toSocialHealthSummary } from '@/features/assessments/social-health/summary';
import { useWeekSummary } from '@/features/assessments/useWeekSummary';
import { getSocialHealthEntryForWeek } from '@/services/social-health';
import { router, useLocalSearchParams } from 'expo-router';

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const state = useWeekSummary({
    weekStart,
    load: getSocialHealthEntryForWeek,
    toSummary: toSocialHealthSummary,
    errorMessage: socialHealthSaveMessage,
  });
  const close = () => router.dismissTo('/home');

  if (state.status !== 'ready') return <SummaryStatus state={state} onClose={close} />;

  const { summary } = state;
  const impact = summary.impactPhrase;
  return (
    <SummaryReport
      title="My Social Health"
      period={summary.period}
      intro="Your answers help your doctor focus on what matters most to your daily life."
      guidance={
        <>
          {impact ? (
            <>
              Your answers indicate that pain{' '}
              <AppText variant="labelLargeBold">{impact}</AppText> your ability to enjoy social
              activities.
            </>
          ) : (
            'Not enough answers to summarise how pain affects your social activities.'
          )}
          {'\n'}With the right treatment and support, you can stay more active and connected.
        </>
      }
      tips={{ label: 'Explore tips on managing emotions', url: TIPS_URL }}
      results={[
        { heading: 'Social life:', value: summary.results.socialLife },
        { heading: 'Travelling:', value: summary.results.travelling },
        { heading: 'Mood:', value: summary.results.mood },
        { heading: 'Relation with others:', value: summary.results.relationWithOthers },
        { heading: 'Enjoyment of life:', value: summary.results.enjoymentOfLife },
      ]}
      savedText="Saved to Care Journal"
      onClose={close}>
      <ReportSection heading="My reflections on mood:">
        <ResultSection heading="General Mood:" value={summary.generalMood} />
        <ResultSection heading="Triggers:" value={summary.triggers} />
      </ReportSection>
    </SummaryReport>
  );
}
