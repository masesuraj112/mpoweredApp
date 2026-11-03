import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceTextInput } from '@/components/tracker/ChoiceTextInput';
import { ReflectionWordCounter } from '@/components/tracker/ReflectionWordCounter';
import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { saveMovementEntry } from '@/services/assessments';
import { useRef, useState } from 'react';
import { countWords, isReflectionTooLong, MAX_REFLECTION_WORDS } from '@/features/assessments/reflection';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
  const reminders = useReminders();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const wordCount = countWords(answers.reflection);
  const overLimit = isReflectionTooLong(answers.reflection);
  const limitMessage = `Your reflection is ${wordCount} words. Please shorten it to ${MAX_REFLECTION_WORDS} words or fewer.`;

  // A ref blocks a second tap in the same tick, before the saving state has re-rendered.
  const inFlight = useRef(false);

  const handleRecord = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setErrorMessage(null);

    const entryDate = getLocalToday();
    const result = await saveMovementEntry(answers, entryDate);
    // The next assessment reminder counts from this one.
    if (result.ok) reminders.refresh();

    inFlight.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrorMessage(assessmentSaveMessage(result.error, 'movement'));
      return;
    }
    router.push({
      pathname: '/tracker/movement/summary',
      params: { weekStart: getWeekStart(entryDate) },
    });
  };

  return (
    // The page keeps the text box above the keyboard.
    <TrackerQuestionScreen title="My Movement">
      <ChoiceCard
        title="Reflection on your movement"
        prompt="Write any reflections of pain impacts on your mobility."
        questionNumber={7}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/standing')}
        onRecord={handleRecord}
        disabled={saving || overLimit}
        validationMessage={overLimit ? limitMessage : (errorMessage ?? undefined)}
        variant="personalCare"
      >
        <ChoiceTextInput
          accessibilityLabel="Reflection on your movement"
          value={answers.reflection ?? ''}
          onChangeText={text => updateAnswer('reflection', text)}
          placeholder="For instance, when pain occurred, you lie down for the whole day"
        />
        <ReflectionWordCounter wordCount={wordCount} overLimit={overLimit} />
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}
