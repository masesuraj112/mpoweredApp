import { useInputStyles } from '@/components/mpowered/inputStyles';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard, QuestionHint } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { useState } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, Text, TextInput, View } from 'react-native';

import { makeStyles, Spacing, Typography, useThemeColors } from '@/constants/theme';
const ACCESSORY_ID = 'activityDone';
const MAX_HOURS = 24;

export default function ActivityScreen() {
  const styles = useStyles();
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
  const { answers, updateAnswer } = useMovementAssessment();

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
    <AssessmentScreen title="My Movement">
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
          placeholderTextColor={colors.textSubtle}
          maxLength={5}
          style={[inputStyles.input, isOverMax && styles.inputError]}
          accessibilityLabel="Hours active per day"
          inputAccessoryViewID={ACCESSORY_ID}
        />
        <QuestionHint>
          Stay active could mean doing your typical activities like working, driving, doing
          house chores, meeting with people, et cetera.
        </QuestionHint>
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
    height: 56,
    borderRadius: 4,
    paddingHorizontal: Spacing.three,
    ...Typography.bodyLarge,
    color: colors.text,
    backgroundColor: colors.surfaceContainer,
    borderBottomWidth: 2,
    borderBottomColor: colors.outline,
  },
  inputError: {
    borderBottomColor: colors.error,
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
}));