import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function EnjoymentScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();

  const handleNext = () => {
    // The slider starts at 0, so record 0 if the user moves on without changing it.
    if (answers.enjoymentOfLife === undefined) {
      updateAnswer('enjoymentOfLife', 0);
    }
    router.push('/tracker/social-health/mood-emotion');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Social Health</Text>
        <ScaleSliderInput
          titleText="Enjoyment of life"
          questionText="Over the past week, how much has pain impacted your ability to enjoy life?"
          assessmentType="enjoyment"
          questionNumber={5}
          totalQuestions={7}
          initialValue={answers.enjoymentOfLife}
          onValueChange={value => updateAnswer('enjoymentOfLife', value)}
          onPrevious={() => router.push('/tracker/social-health/relationships')}
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
