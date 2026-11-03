import {
  AssessmentSummary,
  SummaryHeading,
  SummaryResult,
  SummaryStatus,
  SummaryText,
} from '@/components/mpowered/AssessmentSummary';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import {
  toPersonalCareSummary,
  type PersonalCareSummaryData,
} from '@/features/assessments/personal-care/summary';
import { getPersonalCareEntryForWeek } from '@/services/assessments';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

const DAILY_LIVING_TIPS_URL = 'https://muscha.org/living-well-with-a-musculoskeletal-condition';

const closeToHome = () => router.replace('/home');

function PersonalCareSummaryView({ summary }: { summary: PersonalCareSummaryData }) {
  return (
    <AssessmentSummary
      subheading="This helps guide your treatment and support your recovery."
      reportTitle="My Personal Care"
      period={summary.period}
      summary={summary.message}
      tipsLabel="Explore tips on daily living"
      tipsUrl={DAILY_LIVING_TIPS_URL}
      savedLabel="Saved to Care Journal"
      onClose={closeToHome}>
      <SummaryHeading>My results:</SummaryHeading>
      <SummaryResult
        heading="General Activities:"
        value={summary.generalActivities.join(', ') || 'No activities selected.'}
      />
      <SummaryResult
        heading="Personal care (washing, dressing, etc)"
        value={summary.personalCareLevel || 'No response recorded.'}
      />
      <SummaryResult heading="Sleeping:" value={summary.sleepingLevel || 'No response recorded.'} />
      <SummaryHeading>My reflections:</SummaryHeading>
      <SummaryText>{summary.reflection || 'No reflections added.'}</SummaryText>
    </AssessmentSummary>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: PersonalCareSummaryData };

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.replace('/home');

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    getPersonalCareEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: assessmentSaveMessage(result.error, 'personal care') });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toPersonalCareSummary(result.data) });
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
    return <PersonalCareSummaryView summary={view.summary} />;
  }
  return <SummaryStatus message={view.status === 'loading' ? undefined : view.message} onClose={close} />;
}
