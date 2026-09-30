import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const SLEEPING_OPTIONS = [
  'My sleep is never disturbed by pain',
  'My sleep is occasionally disturbed by pain',
  'Because of pain I have less than 6 hours of sleep',
  'Because of pain I have less than 4 hours of sleep',
  'Because of pain I have less than 2 hours of sleep',
  'Pain prevents me from sleeping at all',
];

export default function SleepingScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const savedIndex = SLEEPING_OPTIONS.indexOf(answers.sleepingLevel ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }

    router.push('/tracker/personal-care/reflection');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Personal Care</Text>
        <SingleChoiceInput
          titleText="Sleeping"
          questionNumber={3}
          totalQuestions={4}
          options={SLEEPING_OPTIONS}
          selectedIndex={selectedIndex}
          onSelectionChange={index => updateAnswer('sleepingLevel', SLEEPING_OPTIONS[index])}
          onPrevious={() => router.push('/tracker/personal-care/care')}
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
