import {
  AssessmentSummary,
  SummaryHeading,
  SummaryResult,
  SummaryStatus,
  SummaryText,
} from '@/components/mpowered/AssessmentSummary';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { toMovementSummary, type MovementSummaryData } from '@/features/assessments/movement/summary';
import { getMovementEntryForWeek } from '@/services/assessments';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

const EXERCISE_INFO_URL = 'https://muscha.org/exercise';

function MovementSummaryView({ summary, onClose }: { summary: MovementSummaryData; onClose: () => void }) {
  // TODO: Persist this report to the My Health before showing its saved status.
  return (
    <AssessmentSummary
      subheading="This helps guide your treatment and support your recovery."
      reportTitle="My Movement"
      period={summary.period}
      summary={summary.message}
      tipsLabel="Explore tips on managing movement"
      tipsUrl={EXERCISE_INFO_URL}
      savedLabel="Saved to My Health"
      onClose={onClose}>
      <SummaryHeading>My results:</SummaryHeading>
      <SummaryResult
        heading="Average activity hour:"
        value={`Last week, I was able to stay active for approximately ${summary.activeHours} hours`}
      />
      <SummaryResult
        heading="General Movement:"
        value={summary.generalImpacts.length > 0 ? summary.generalImpacts.join(' ') : 'No impacts reported this week.'}
      />
      <SummaryResult heading="Walking:" value={summary.walking || 'No response recorded.'} />
      <SummaryResult heading="Lifting:" value={summary.lifting || 'No response recorded.'} />
      <SummaryResult heading="Sitting:" value={summary.sitting || 'No response recorded.'} />
      <SummaryResult heading="Standing:" value={summary.standing || 'No response recorded.'} />
      <SummaryHeading>My reflections:</SummaryHeading>
      <SummaryText>{summary.reflection || 'No reflection recorded.'}</SummaryText>
    </AssessmentSummary>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: MovementSummaryData };

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.replace('/home');

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    getMovementEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: assessmentSaveMessage(result.error, 'movement') });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toMovementSummary(result.data) });
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
    return <MovementSummaryView summary={view.summary} onClose={close} />;
  }
  return <SummaryStatus message={view.status === 'loading' ? undefined : view.message} onClose={close} />;
}
