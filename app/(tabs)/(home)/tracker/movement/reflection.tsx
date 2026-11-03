import { useInputStyles } from '@/components/mpowered/inputStyles';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { saveMovementEntry } from '@/services/assessments';
import { useRef, useState } from 'react';
import { countWords, isReflectionTooLong, MAX_REFLECTION_WORDS } from '@/features/assessments/reflection';
import { InputAccessoryView, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { makeStyles, Spacing, Typography, useThemeColors } from '@/constants/theme';
const ACCESSORY_ID = 'reflectionDone';

export default function ReflectionScreen() {
  const styles = useStyles();
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
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
    <AssessmentScreen title="My Movement">
      <ChoiceCard
        title="Reflection on your movement"
        prompt="Write any reflections of pain impacts on your mobility."
        questionNumber={7}
        totalQuestions={7}
        onPrevious={() => router.push('/tracker/movement/standing')}
        onRecord={handleRecord}
        disabled={saving || overLimit}
        validationMessage={overLimit ? limitMessage : (errorMessage ?? undefined)}
        variant="personalCare"
      >
        <TextInput
          value={answers.reflection ?? ''}
          onChangeText={text => updateAnswer('reflection', text)}
          placeholder="For instance, when pain occurred, you lie down for the whole day"
          placeholderTextColor={colors.textSubtle}
          multiline
          textAlignVertical="top"
          style={[inputStyles.input, inputStyles.multiline]}
          accessibilityLabel="Reflection on your movement"
          inputAccessoryViewID={ACCESSORY_ID}
        />
        <Text style={[styles.counter, overLimit && styles.counterOver]} accessibilityLiveRegion="polite">
          {wordCount}/{MAX_REFLECTION_WORDS} words
        </Text>
      </ChoiceCard>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <Pressable onPress={Keyboard.dismiss} accessibilityRole="button" accessibilityLabel="Done">
              <Text style={styles.accessoryDone}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </AssessmentScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  input: {
    flex: 1,
    minHeight: 120,
    borderRadius: 4,
    padding: Spacing.three,
    ...Typography.bodySmall,
    color: colors.text,
    backgroundColor: colors.surfaceContainer,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
  },
  accessoryBar: {
    alignItems: 'flex-end',
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  accessoryDone: {
    color: colors.primary,
    ...Typography.bodyLarge,
    fontWeight: '600',
  },
  counter: {
    ...Typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  counterOver: {
    color: colors.error,
  },
}));