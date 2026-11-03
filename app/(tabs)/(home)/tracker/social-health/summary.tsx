import {
  AssessmentSummary,
  SummaryEmphasis,
  SummaryHeading,
  SummaryResult,
  SummaryStatus,
} from '@/components/mpowered/AssessmentSummary';
import { TIPS_URL } from '@/constants/socialHealthOptions';
import { socialHealthSaveMessage } from '@/features/assessments/social-health/messages';
import {
  toSocialHealthSummary,
  type SocialHealthSummaryData,
} from '@/features/assessments/social-health/summary';
import { getSocialHealthEntryForWeek } from '@/services/social-health';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

function SocialHealthSummaryView({ summary, onClose }: { summary: SocialHealthSummaryData; onClose: () => void }) {
  const impact = summary.impactPhrase;

  return (
    <AssessmentSummary
      subheading="Your answers help your doctor focus on what matters most to your daily life."
      reportTitle="My Social Health"
      period={summary.period}
      summary={
        <>
          {impact ? (
            <>
              Your answers indicate that pain <SummaryEmphasis>{impact}</SummaryEmphasis> your ability to enjoy
              social activities.
            </>
          ) : (
            'Not enough answers to summarise how pain affects your social activities.'
          )}
          {'\n'}With the right treatment and support, you can stay more active and connected.
        </>
      }
      tipsLabel="Explore tips on managing emotions"
      tipsUrl={TIPS_URL}
      savedLabel="Saved to Care Journal"
      onClose={onClose}>
      <SummaryHeading>My results:</SummaryHeading>
      <SummaryResult heading="Social life:" value={summary.results.socialLife} />
      <SummaryResult heading="Travelling:" value={summary.results.travelling} />
      <SummaryResult heading="Mood:" value={summary.results.mood} />
      <SummaryResult heading="Relation with others:" value={summary.results.relationWithOthers} />
      <SummaryResult heading="Enjoyment of life:" value={summary.results.enjoymentOfLife} />
      <SummaryHeading>My reflections on mood:</SummaryHeading>
      <SummaryResult heading="General Mood:" value={summary.generalMood} />
      <SummaryResult heading="Triggers:" value={summary.triggers} />
    </AssessmentSummary>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: SocialHealthSummaryData };

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.dismissTo('/home');

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    getSocialHealthEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: socialHealthSaveMessage(result.error) });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toSocialHealthSummary(result.data) });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  const view: SummaryState = weekStart
    ? state
    : { status: 'error', message: 'We could not find the week to show.' };

  if (view.status === 'ready') {
    return <SocialHealthSummaryView summary={view.summary} onClose={close} />;
  }

  return <SummaryStatus message={view.status === 'loading' ? undefined : view.message} onClose={close} />;
}
