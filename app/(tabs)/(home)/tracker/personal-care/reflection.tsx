import { useInputStyles } from '@/components/mpowered/inputStyles';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import {
  countWords,
  isReflectionTooLong,
  MAX_REFLECTION_WORDS,
} from '@/features/assessments/reflection';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { savePersonalCareEntry } from '@/services/assessments';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Text, TextInput } from 'react-native';

import { makeStyles, Typography, useThemeColors } from '@/constants/theme';
export default function ReflectionScreen() {
  const styles = useStyles();
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const reminders = useReminders();
  const doneBar = useKeyboardDoneBar();
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
    <AssessmentScreen title="My Personal Care">
      <ChoiceCard
        title="Reflection on your personal care"
        prompt={<QuestionPrompt>Write any reflections of pain impacts on your daily life:</QuestionPrompt>}
        questionNumber={4}
        totalQuestions={4}
        onPrevious={() => router.dismissTo('/tracker/personal-care/sleeping')}
        onRecord={handleRecord}
        disabled={saving || overLimit}
        validationMessage={errorMessage ?? undefined}
        variant="personalCare"
      >
        <TextInput
          accessibilityLabel="Reflection on your personal care"
          multiline
          inputAccessoryViewID={doneBar.id}
          value={answers.reflection ?? ''}
          onChangeText={value => updateAnswer('reflection', value)}
          placeholder="For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable"
          placeholderTextColor={colors.textSubtle}
          textAlignVertical="top"
          style={[inputStyles.input, inputStyles.multiline]}
        />
        <Text style={[styles.counter, overLimit && styles.counterOver]} accessibilityLiveRegion="polite">
          {wordCount} / {MAX_REFLECTION_WORDS} words
        </Text>
      </ChoiceCard>
      {doneBar.bar}
    </AssessmentScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  counter: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  counterOver: {
    color: colors.error,
  },
}));