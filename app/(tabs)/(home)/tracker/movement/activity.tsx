import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ContentColumn, makeStyles, Spacing, Typography, useThemeColors } from '@/constants/theme';
const ACCESSORY_ID = 'activityDone';
const MAX_HOURS = 24;

export default function ActivityScreen() {
  const styles = useStyles();
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
    <View style={styles.screen}>
      {/* A wrapping Touchable steals taps from the TextInput (notably on web), so dismiss via ScrollView instead. */}
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="General Movement Impacts"
          prompt="On average, how many hours per day were you able to stay active or mobile last week?"
          questionNumber={1}
          totalQuestions={7}
          onRecord={() => router.push('/tracker/movement/general')}
          disabled={answers.activeHours === undefined || isOverMax}
          validationMessage={isOverMax ? `Please enter ${MAX_HOURS} hours or less` : undefined}
          variant="personalCare"
          style={{ flex: 1, height: undefined }}
        >
          <TextInput
            value={text}
            onChangeText={handleChange}
            keyboardType="decimal-pad"
            placeholder="Input number only"
            placeholderTextColor={colors.textSubtle}
            maxLength={5}
            style={[styles.input, isOverMax && styles.inputError]}
            accessibilityLabel="Hours active per day"
            inputAccessoryViewID={ACCESSORY_ID}
          />
          <Text style={styles.helper}>
            Stay active could mean doing your typical activities like working, driving, doing
            house chores, meeting with people, et cetera.
          </Text>
        </ChoiceCard>
      </ScrollView>

      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={ACCESSORY_ID}>
          <View style={styles.accessoryBar}>
            <Pressable onPress={Keyboard.dismiss} accessibilityRole="button" accessibilityLabel="Done">
              <Text style={styles.accessoryDone}>Done</Text>
            </Pressable>
          </View>
        </InputAccessoryView>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: { flex: 1, backgroundColor: colors.surface },
  container: {
    ...ContentColumn,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  pageTitle: {
    ...Typography.title,
    color: colors.text,
    marginLeft: Spacing.two,
    marginBottom: Spacing.three,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: 4,
    paddingHorizontal: Spacing.three,
    ...Typography.bodyLarge,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
  },
  helper: {
    marginTop: Spacing.three,
    ...Typography.caption,
    letterSpacing: 0.4,
    color: colors.textSecondary,
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