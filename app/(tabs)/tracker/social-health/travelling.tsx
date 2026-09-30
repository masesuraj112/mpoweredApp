import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const SOCIAL_HEALTH_OPTIONS = [
  'I can travel anywhere without pain',
  'I can travel anywhere but it gives me extra pain',
  'Pain is bad but I manage journeys over two hours',
  'Pain restricts me to journeys of less than one hour',
  'Pain restricts me to short necessary journeys under 30 minutes',
  'Pain prevents me from traveling except to receive treatment',
];

export default function TravellingScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();
  const savedIndex = SOCIAL_HEALTH_OPTIONS.indexOf(answers.travel ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }
    router.push('/tracker/social-health/mood');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Social Health</Text>
        <SingleChoiceInput
          titleText="Travelling"
          questionNumber={2}
          totalQuestions={7}
          options={SOCIAL_HEALTH_OPTIONS}
          selectedIndex={selectedIndex}
          onSelectionChange={index => updateAnswer('travel', SOCIAL_HEALTH_OPTIONS[index])}
          onPrevious={() => router.push('/tracker/social-health/social-life')}
          onRecord={handleNext}
          variant="personalCare"
          cardHeight={scaleHeight(558)}
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
