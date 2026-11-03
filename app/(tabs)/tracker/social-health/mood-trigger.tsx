import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceTextInput } from '@/components/tracker/ChoiceTextInput';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { socialHealthSaveMessage } from '@/features/assessments/social-health/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { saveSocialHealthEntry } from '@/services/social-health';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

export default function MoodTriggerScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();
  const reminders = useReminders();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A ref blocks a second tap in the same tick, before the saving state has re-rendered.
  const inFlight = useRef(false);

  const handleRecord = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setErrorMessage(null);

    const entryDate = answers.entryDate ?? getLocalToday();
    const result = await saveSocialHealthEntry(answers, entryDate);
    // The next assessment reminder counts from this one.
    if (result.ok) reminders.refresh();

    inFlight.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrorMessage(socialHealthSaveMessage(result.error));
      return;
    }
    router.push({
      pathname: '/tracker/social-health/summary',
      params: { weekStart: getWeekStart(entryDate) },
    });
  };

  return (
    <TrackerQuestionScreen title="My Social Health">
      <ChoiceCard
        title="Mood"
        prompt="What triggered that mood?"
        questionNumber={7}
        totalQuestions={7}
        onPrevious={() => router.push('/tracker/social-health/mood-emotion')}
        onRecord={handleRecord}
        disabled={saving}
        validationMessage={errorMessage ?? undefined}
        variant="personalCare"
      >
        <ChoiceTextInput
          accessibilityLabel="What triggered that mood?"
          value={answers.emotionReflection ?? ''}
          onChangeText={value => updateAnswer('emotionReflection', value)}
          placeholder="i.e: delayed in work due to pain, inability to meet with friends, etc"
        />
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

