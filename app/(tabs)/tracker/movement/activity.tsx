import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { TrackerPageTitle } from '@/components/tracker/TrackerQuestionScreen';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput } from 'react-native';

const MAX_HOURS = 24;

export default function ActivityScreen() {
  const { answers, updateAnswer } = useMovementAssessment();
  const doneBar = useKeyboardDoneBar();

  // Keep the raw text locally so partial input like "0" or "1." isn't rewritten mid-typing.
  const [text, setText] = useState(answers.activeHours?.toString() ?? '');
  const isOverMax = answers.activeHours !== undefined && answers.activeHours > MAX_HOURS;

  const handleChange = (input: string) => {
    // Allow digits and a single decimal point (e.g. 1.5 hours).
    const cleaned = input.replace(/,/g, '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    setText(cleaned);
    const value = parseFloat(cleaned);
    updateAnswer('activeHours', Number.isNaN(value) ? undefined : value);
  };

  return (
    // A wrapping Touchable steals taps from the TextInput (notably on web), so the keyboard closes on scroll instead.
    <Screen edges={[]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <TrackerPageTitle>My Movement</TrackerPageTitle>
      <ChoiceCard
        title="General Movement Impacts"
        prompt="On average, how many hours per day were you able to stay active or mobile last week?"
        questionNumber={1}
        totalQuestions={7}
        onRecord={() => router.push('/tracker/movement/general')}
        disabled={answers.activeHours === undefined || isOverMax}
        validationMessage={isOverMax ? `Please enter ${MAX_HOURS} hours or less` : undefined}
        variant="personalCare"
      >
        <TextInput
          value={text}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder="Input number only"
          placeholderTextColor={Colors.light.textSecondary}
          maxLength={5}
          style={[styles.input, isOverMax && styles.inputError]}
          accessibilityLabel="Hours active per day"
          inputAccessoryViewID={doneBar.id}
        />
        {doneBar.bar}
        <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.helper}>
          Stay active could mean doing your typical activities like working, driving, doing
          house chores, meeting with people, et cetera.
        </AppText>
      </ChoiceCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    ...Typography.bodyLarge,
    minHeight: MinTapTarget + Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.outlineMedium,
    borderRadius: Radius.small,
    color: Colors.light.onSurface,
  },
  inputError: {
    borderColor: Colors.light.error,
  },
  helper: {
    marginTop: Spacing.three,
  },
});
