import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function MoodScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();

  const handleNext = () => {
    // The slider starts at 0, so record 0 if the user moves on without changing it.
    if (answers.moodNumber === undefined) {
      updateAnswer('moodNumber', 0);
    }
    router.push('/tracker/social-health/relationships');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Social Health</Text>
        <ScaleSliderInput
          titleText="Mood"
          questionText="Over the past week, how much has pain impacted your mood?"
          assessmentType="mood"
          questionNumber={3}
          totalQuestions={7}
          initialValue={answers.moodNumber ?? 0}
          onValueChange={value => updateAnswer('moodNumber', value)}
          onPrevious={() => router.push('/tracker/social-health/travelling')}
          onRecord={handleNext}
          variant="personalCare"
          cardHeight={scaleHeight(330)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
});
