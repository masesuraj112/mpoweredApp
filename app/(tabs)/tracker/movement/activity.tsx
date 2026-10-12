import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const ACCESSORY_ID = 'activityDone';
const MAX_HOURS = 24;

export default function ActivityScreen() {
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
            placeholderTextColor="#79747E"
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  container: {
    flexGrow: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
    paddingBottom: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  input: {
    height: scaleHeight(56),
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(16),
    fontSize: scaleFont(16),
    color: '#1D1B20',
  },
  inputError: {
    borderColor: '#B3261E',
  },
  helper: {
    marginTop: scaleHeight(16),
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
    letterSpacing: 0.4,
    color: '#49454F',
  },
  accessoryBar: {
    alignItems: 'flex-end',
    backgroundColor: '#E8DEF8',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(10),
  },
  accessoryDone: {
    color: '#6750A4',
    fontSize: scaleFont(16),
    fontWeight: '600',
  },
});