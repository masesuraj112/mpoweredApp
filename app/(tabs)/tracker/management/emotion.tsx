import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { managementSaveMessage } from '@/features/assessments/management/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { saveManagementEntry } from '@/services/management';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function EmotionScreen() {
  const { answers, updateAnswer } = useManagementAssessment();
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
          <View style={styles.promptContent}>
            <Text style={styles.promptText}>
              Over the past week, did you perform any strategies to manage your stress level or emotion?
            </Text>
            <Text style={styles.examples}>
              Examples: meditation, journaling, meeting people
            </Text>
          </View>
        }
        questionNumber={4}
        totalQuestions={4}
        onPrevious={() => router.push('/tracker/management/exercise')}
        onRecord={handleRecord}
        disabled={saving}
        validationMessage={errorMessage ?? undefined}
        variant="management"
        cardHeight={scaleHeight(516)}
      >
        <TextInput
          accessibilityLabel="Emotion management strategies"
          multiline
          inputAccessoryViewID={doneBar.id}
          value={answers.emotionStrategies ?? ''}
          onChangeText={value => updateAnswer('emotionStrategies', value)}
          placeholder="Write about any strategies you used to manage your emotions"
          placeholderTextColor="#B3B3B3"
          textAlignVertical="top"
          style={styles.input}
        />
      </ChoiceCard>
      {doneBar.bar}
    </AssessmentScreen>
  );
}

const styles = StyleSheet.create({
  promptContent: {
    gap: scaleHeight(12),
  },
  promptText: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  examples: {
    color: '#727272',
    fontSize: scaleFont(12),
    fontStyle: 'italic',
    lineHeight: scaleHeight(18),
  },
  input: {
    height: scaleHeight(146),
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: scaleWidth(8),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    color: '#1D1B20',
    fontSize: scaleFont(14),
    lineHeight: scaleHeight(20),
  },
});
