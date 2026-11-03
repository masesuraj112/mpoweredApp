import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoicePrompt } from '@/components/tracker/ChoicePrompt';
import { ChoiceTextInput } from '@/components/tracker/ChoiceTextInput';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { managementSaveMessage } from '@/features/assessments/management/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { saveManagementEntry } from '@/services/management';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

export default function EmotionScreen() {
  const { answers, updateAnswer } = useManagementAssessment();
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
    const result = await saveManagementEntry(answers, entryDate);
    // The next assessment reminder counts from this one.
    if (result.ok) reminders.refresh();

    inFlight.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrorMessage(managementSaveMessage(result.error));
      return;
    }
    router.push({
      pathname: '/tracker/management/summary',
      params: { weekStart: getWeekStart(entryDate) },
    });
  };

  return (
    <TrackerQuestionScreen title="My Management">
      <ChoiceCard
        title="Emotion"
        prompt={
          <ChoicePrompt note="Examples: meditation, journaling, meeting people">
            Over the past week, did you perform any strategies to manage your stress level or emotion?
          </ChoicePrompt>
        }
        questionNumber={4}
        totalQuestions={4}
        onPrevious={() => router.push('/tracker/management/exercise')}
        onRecord={handleRecord}
        disabled={saving}
        validationMessage={errorMessage ?? undefined}
        variant="management"
      >
        <ChoiceTextInput
          accessibilityLabel="Emotion management strategies"
          value={answers.emotionStrategies ?? ''}
          onChangeText={value => updateAnswer('emotionStrategies', value)}
          placeholder="Write about any strategies you used to manage your emotions"
        />
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

