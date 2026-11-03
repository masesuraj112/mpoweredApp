import {
  AssessmentSummary,
  SummaryEmphasis,
  SummaryHeading,
  SummaryResult,
  SummaryStatus,
  SummaryText,
} from '@/components/mpowered/AssessmentSummary';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { toPainSummary, type PainSummaryData } from '@/features/assessments/pain/summary';
import { getPainEntryForWeek } from '@/services/assessments';
import { painSaveMessage } from '@/features/assessments/pain/messages';

interface PainSummaryProps {
  summary: PainSummaryData;
  onClose: () => void;
}

function PainSummaryView({ summary, onClose }: PainSummaryProps) {
  const { intensity } = summary;
  return (
    <AssessmentSummary
      subheading="This helps guide your treatment and support your recovery."
      reportTitle="My Pain"
      period={summary.period}
      savedLabel="Saved to My Health"
      onClose={onClose}>
      <SummaryHeading>Pain location</SummaryHeading>
      <SummaryText>
        I have pain in the following areas:
        {summary.locations.map((location) => `\n• ${location}`).join('')}
      </SummaryText>
      <SummaryHeading>Pain characteristics</SummaryHeading>
      <SummaryText>
        My pain were: <SummaryEmphasis>{summary.characteristics.join(', ')}</SummaryEmphasis>
      </SummaryText>
      <SummaryHeading>Pain intensity</SummaryHeading>
      <SummaryResult heading={`Current pain: ${intensity.current.value}`} value={intensity.current.description} />
      <SummaryResult heading={`Mildest pain: ${intensity.mildest.value}`} value={intensity.mildest.description} />
      <SummaryResult heading={`Worst pain: ${intensity.worst.value}`} value={intensity.worst.description} />
      <SummaryResult heading={`Average pain: ${intensity.average.value}`} value={intensity.average.description} />
    </AssessmentSummary>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: PainSummaryData };

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function PainSummary() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.dismissTo('/home');

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    getPainEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: painSaveMessage(result.error) });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toPainSummary(result.data) });
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
    return <PainSummaryView summary={view.summary} onClose={close} />;
  }
  return <SummaryStatus message={view.status === 'loading' ? undefined : view.message} onClose={close} />;
}
