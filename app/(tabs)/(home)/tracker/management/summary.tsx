import {
  AssessmentSummary,
  SummaryHeading,
  SummaryResult,
  SummaryStatus,
} from '@/components/mpowered/AssessmentSummary';
import { MANAGEMENT_TIPS_URL } from '@/constants/managementOptions';
import { managementSaveMessage } from '@/features/assessments/management/messages';
import {
  toManagementSummary,
  type ManagementSummaryData,
} from '@/features/assessments/management/summary';
import { getManagementEntryForWeek } from '@/services/management';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

function ManagementSummaryView({ summary, onClose }: { summary: ManagementSummaryData; onClose: () => void }) {
  // TODO: Persist this report to the My Health before showing its saved status.
  return (
    <AssessmentSummary
      subheading="Your answers help your doctor focus on what matters most to your daily life."
      reportTitle="My Management"
      period={summary.period}
      summary={summary.summarySentence}
      tipsLabel="Explore tips on managing pain"
      tipsUrl={MANAGEMENT_TIPS_URL}
      savedLabel="Saved to My Health"
      onClose={onClose}>
      <SummaryHeading>My results:</SummaryHeading>
      <SummaryResult heading="Medication:" value={summary.medicationResult} />
      <SummaryResult heading="Exercise:" value={summary.exerciseResult} />
      <SummaryResult heading="Emotion:" value={summary.emotionResult} />
    </AssessmentSummary>
  );
}

type SummaryState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; summary: ManagementSummaryData };

// The route: shows the entry that was just saved for the week passed in the 'weekStart' param.
export default function SummaryScreen() {
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStart = Array.isArray(params.weekStart) ? params.weekStart[0] : params.weekStart;
  const [state, setState] = useState<SummaryState>({ status: 'loading' });
  const close = () => router.replace('/home');

  useEffect(() => {
    if (!weekStart) return;
    let cancelled = false;
    getManagementEntryForWeek(weekStart).then(result => {
      if (cancelled) return;
      if (!result.ok) {
        setState({ status: 'error', message: managementSaveMessage(result.error) });
      } else if (!result.data) {
        setState({ status: 'error', message: 'We could not find your saved entry.' });
      } else {
        setState({ status: 'ready', summary: toManagementSummary(result.data) });
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
    return <ManagementSummaryView summary={view.summary} onClose={close} />;
  }

  return <SummaryStatus message={view.status === 'loading' ? undefined : view.message} onClose={close} />;
}
