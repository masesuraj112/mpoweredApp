import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { assessmentSaveMessage } from '@/features/assessments/messages';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import {
  countWords,
  isReflectionTooLong,
  MAX_REFLECTION_WORDS,
} from '@/features/assessments/reflection';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { savePersonalCareEntry } from '@/services/assessments';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

export default function ReflectionScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
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
        prompt={<Text style={styles.prompt}>Write any reflections of pain impacts on your daily life:</Text>}
        questionNumber={4}
        totalQuestions={4}
        onPrevious={() => router.push('/tracker/personal-care/sleeping')}
        onRecord={handleRecord}
        disabled={saving || overLimit}
        validationMessage={errorMessage ?? undefined}
        variant="personalCare"
        cardHeight={scaleHeight(554)}
      >
        <TextInput
          accessibilityLabel="Reflection on your personal care"
          multiline
          inputAccessoryViewID={doneBar.id}
          value={answers.reflection ?? ''}
          onChangeText={value => updateAnswer('reflection', value)}
          placeholder="For instance, this week, I felt that I could not everything at all, I felt hopeless, even doing the laundry felt miserable"
          placeholderTextColor="#B5B5B5"
          textAlignVertical="top"
          style={styles.reflectionInput}
        />
        <Text style={[styles.counter, overLimit && styles.counterOver]} accessibilityLiveRegion="polite">
          {wordCount} / {MAX_REFLECTION_WORDS} words
        </Text>
      </ChoiceCard>
      {doneBar.bar}
    </AssessmentScreen>
  );
}

const styles = StyleSheet.create({
  prompt: {
    color: '#1D1B20',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  reflectionInput: {
    minHeight: scaleHeight(80),
    borderWidth: 1,
    borderColor: '#DADADA',
    borderRadius: scaleWidth(8),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scaleWidth(14),
    paddingVertical: scaleHeight(10),
    color: '#1D1B20',
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
  },
  counter: {
    marginTop: scaleHeight(6),
    textAlign: 'right',
    color: '#49454F',
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
  },
  counterOver: {
    color: '#B3261E',
    fontWeight: '600',
  },
});