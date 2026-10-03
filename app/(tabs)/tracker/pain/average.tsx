import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { painSaveMessage } from '@/features/assessments/pain/messages';
import { getLocalToday, getWeekStart } from '@/features/assessments/week';
import { savePainEntry } from '@/services/assessments';
import { scaleFont } from '@/services/scale';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';


export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // A ref blocks a second tap in the same tick, before the saving state has re-rendered.
  const inFlight = useRef(false);

  const handleFinish = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setSaving(true);
    setErrorMessage(null);

    // An untouched slider never writes an answer, so write the value the user is looking at.
    const averagePain = answers.averagePain ?? 0;
    updateAnswer('averagePain', averagePain);
    const entryDate = answers.entryDate ?? getLocalToday();

    const result = await savePainEntry({ ...answers, averagePain }, entryDate);

    inFlight.current = false;
    setSaving(false);
    if (!result.ok) {
      setErrorMessage(painSaveMessage(result.error));
      return;
    }
    router.push({
      pathname: '/tracker/pain/summary',
      params: { weekStart: getWeekStart(entryDate) },
    });
  };

  return (
    <View style={styles.screen}>
      {/* input component goes here */}
      <Text style={styles.cardTitle}>My Pain</Text>

      <ScaleSliderInput
        underLinedText="average pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={6}
        totalQuestions={6}
        initialValue={answers.averagePain ?? 0}
        onValueChange={value => updateAnswer('averagePain', value)}
        onPrevious={() => router.push('/tracker/pain/worst')}
        onRecord={handleFinish}
        disabled={saving}
        validationMessage={errorMessage ?? undefined}
        variant="painTracker"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 16,
    paddingTop: 20, // extra top space to clear the status bar/notch area
  },
  cardTitle: {
      fontSize: scaleFont(26),
      fontWeight: '500',
      marginBottom: 20
  },
});
