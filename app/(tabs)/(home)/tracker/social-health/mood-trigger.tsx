import { useInputStyles } from '@/components/mpowered/inputStyles';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { socialHealthSaveMessage } from '@/features/assessments/social-health/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { saveSocialHealthEntry } from '@/services/social-health';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { useThemeColors } from '@/constants/theme';
export default function MoodTriggerScreen() {
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
  const { answers, updateAnswer } = useSocialHealthAssessment();
  const reminders = useReminders();
  const doneBar = useKeyboardDoneBar();
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
    <AssessmentScreen title="My Social Health">
      <ChoiceCard
        title="Mood"
        prompt={<QuestionPrompt>What triggered that mood?</QuestionPrompt>}
        questionNumber={7}
        totalQuestions={7}
        onPrevious={() => router.push('/tracker/social-health/mood-emotion')}
        onRecord={handleRecord}
        disabled={saving}
        validationMessage={errorMessage ?? undefined}
        variant="personalCare"
      >
        <TextInput
          accessibilityLabel="What triggered that mood?"
          multiline
          inputAccessoryViewID={doneBar.id}
          value={answers.emotionReflection ?? ''}
          onChangeText={value => updateAnswer('emotionReflection', value)}
          placeholder="i.e: delayed in work due to pain, inability to meet with friends, etc"
          placeholderTextColor={colors.textSubtle}
          textAlignVertical="top"
          style={[inputStyles.input, inputStyles.multiline]}
        />
      </ChoiceCard>
      {doneBar.bar}
    </AssessmentScreen>
  );
}

