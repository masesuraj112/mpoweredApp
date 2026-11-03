import { useInputStyles } from '@/components/mpowered/inputStyles';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard, QuestionHint, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { managementSaveMessage } from '@/features/assessments/management/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { saveManagementEntry } from '@/services/management';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { TextInput } from 'react-native';

import { useThemeColors } from '@/constants/theme';
export default function EmotionScreen() {
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
  const { answers, updateAnswer } = useManagementAssessment();
  const reminders = useReminders();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A ref blocks a second tap in the same tick, before the saving state has re-rendered.
  const inFlight = useRef(false);
  const doneBar = useKeyboardDoneBar();

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
    <AssessmentScreen title="My Management">
      <ChoiceCard
        title="Emotion"
        prompt={
          <>
            <QuestionPrompt>
              Over the past week, did you perform any strategies to manage your stress level or emotion?
            </QuestionPrompt>
            <QuestionHint>
              Examples: meditation, journaling, meeting people
            </QuestionHint>
          </>
        }
        questionNumber={4}
        totalQuestions={4}
        onPrevious={() => router.dismissTo('/tracker/management/exercise')}
        onRecord={handleRecord}
        disabled={saving}
        validationMessage={errorMessage ?? undefined}
        variant="management"
      >
        <TextInput
          accessibilityLabel="Emotion management strategies"
          multiline
          inputAccessoryViewID={doneBar.id}
          value={answers.emotionStrategies ?? ''}
          onChangeText={value => updateAnswer('emotionStrategies', value)}
          placeholder="Write about any strategies you used to manage your emotions"
          placeholderTextColor={colors.textSubtle}
          textAlignVertical="top"
          style={[inputStyles.input, inputStyles.multiline]}
        />
      </ChoiceCard>
      {doneBar.bar}
    </AssessmentScreen>
  );
}

