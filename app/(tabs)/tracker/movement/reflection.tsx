import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceTextInput } from '@/components/tracker/ChoiceTextInput';
import { ReflectionWordCounter } from '@/components/tracker/ReflectionWordCounter';
import { TrackerPageTitle } from '@/components/tracker/TrackerQuestionScreen';
import { Screen } from '@/components/ui/Screen';
import { MinTapTarget, Spacing } from '@/constants/theme';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { useReminders } from '@/features/notifications/RemindersContext';
import { saveMovementEntry } from '@/services/assessments';
import { useRef, useState } from 'react';
import { countWords, isReflectionTooLong, MAX_REFLECTION_WORDS } from '@/features/assessments/reflection';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
  const reminders = useReminders();
  const insets = useSafeAreaInsets();
  // The space the keyboard has to leave for the navigation header: status bar, back button and padding.
  const headerHeight = insets.top + Spacing.two + MinTapTarget + Spacing.two;
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
    <KeyboardAvoidingView
      style={styles.fill}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      {/* A wrapping Touchable steals taps from the TextInput (notably on web), so the keyboard closes on scroll instead. */}
      <Screen edges={[]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <TrackerPageTitle>My Movement</TrackerPageTitle>
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
          <ChoiceTextInput
            fill
            accessibilityLabel="Reflection on your movement"
            value={answers.reflection ?? ''}
            onChangeText={text => updateAnswer('reflection', text)}
            placeholder="For instance, when pain occurred, you lie down for the whole day"
          />
          <ReflectionWordCounter wordCount={wordCount} overLimit={overLimit} />
        </ChoiceCard>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
