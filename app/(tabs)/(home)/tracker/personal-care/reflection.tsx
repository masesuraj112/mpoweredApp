import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceTextInput } from '@/components/tracker/ChoiceTextInput';
import { ReflectionWordCounter } from '@/components/tracker/ReflectionWordCounter';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { countWords, isReflectionTooLong } from '@/features/assessments/reflection';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { savePersonalCareEntry } from '@/services/assessments';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const reminders = useReminders();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A ref blocks a second tap in the same tick, before the saving state has re-rendered.
  const inFlight = useRef(false);

  const wordCount = countWords(answers.reflection ?? '');
  const overLimit = isReflectionTooLong(answers.reflection ?? '');

  const handleRecord = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setErrorMessage(null);

    const entryDate = getLocalToday();
    const result = await savePersonalCareEntry(answers, entryDate);
    // The next assessment reminder counts from this one.
    if (result.ok) reminders.refresh();

    inFlight.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrorMessage(assessmentSaveMessage(result.error, 'personal care'));
      return;
    }
    router.push({
      pathname: '/tracker/personal-care/summary',
      params: { weekStart: getWeekStart(entryDate) },
    });
  };

  return (
    <TrackerQuestionScreen title="My Personal Care">
      <ChoiceCard
        title="Reflection on your personal care"
        prompt="Write any reflections of pain impacts on your daily life:"
        questionNumber={4}
        totalQuestions={4}
        onPrevious={() => router.dismissTo('/tracker/personal-care/sleeping')}
        onRecord={handleRecord}
        disabled={saving || overLimit}
        validationMessage={errorMessage ?? undefined}
        variant="personalCare"
      >
        <ChoiceTextInput
          accessibilityLabel="Reflection on your personal care"
          value={answers.reflection ?? ''}
          onChangeText={value => updateAnswer('reflection', value)}
          placeholder="For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable"
        />
        <ReflectionWordCounter wordCount={wordCount} overLimit={overLimit} />
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}
