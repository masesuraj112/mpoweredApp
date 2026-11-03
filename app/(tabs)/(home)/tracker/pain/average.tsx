import { ScaleSliderInput } from '@/components/tracker/ScaleSliderInput';
import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { painSaveMessage } from '@/features/assessments/pain/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { savePainEntry } from '@/services/assessments';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  const reminders = useReminders();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A ref blocks a second tap in the same tick, before the saving state has re-rendered.
  const inFlight = useRef(false);

  const handleFinish = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setErrorMessage(null);

    // An untouched slider never writes an answer, so write the value the user is looking at.
    const averagePain = answers.averagePain ?? 0;
    updateAnswer('averagePain', averagePain);
    const entryDate = answers.entryDate ?? getLocalToday();

    const result = await savePainEntry({ ...answers, averagePain }, entryDate);
    // The next assessment reminder counts from this one.
    if (result.ok) reminders.refresh();

    inFlight.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrorMessage(painSaveMessage(result.error));
      return;
    }
    router.push({
      pathname: '/tracker/pain/summary',
      params: { weekStart: getWeekStart(entryDate) },
    });
  };

  return (
    <TrackerQuestionScreen title="My Pain">
<ScaleSliderInput
        underLinedText="average pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={6}
        totalQuestions={6}
        initialValue={answers.averagePain ?? 0}
        onValueChange={value => updateAnswer('averagePain', value)}
        onPrevious={() => router.push('/tracker/pain/worst')}
        onRecord={handleFinish}
        disabled={saving}
        validationMessage={errorMessage ?? undefined}
        variant="painTracker"
      />
    </TrackerQuestionScreen>
  );
}

