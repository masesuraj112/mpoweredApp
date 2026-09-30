import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const PERSONAL_CARE_OPTIONS = [
  'I can look after myself normally without causing extra pain',
  'I can look after myself normally but it causes extra pain',
  'It is painful to look after myself and I am slow and careful',
  'I need some help but manage most of my personal care',
  'I need help everyday in most aspects of self-care',
  'I do not get dressed, I wash with difficulty and stay in bed',
];

export default function CareScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const savedIndex = PERSONAL_CARE_OPTIONS.indexOf(answers.personalCareLevel ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }

    router.push('/tracker/personal-care/sleeping');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Personal Care</Text>
        <SingleChoiceInput
          titleText="Personal care (washing, dressing, etc)"
          questionNumber={2}
          totalQuestions={4}
          options={PERSONAL_CARE_OPTIONS}
          selectedIndex={selectedIndex}
          onSelectionChange={index => updateAnswer('personalCareLevel', PERSONAL_CARE_OPTIONS[index])}
          onPrevious={() => router.push('/tracker/personal-care/general')}
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
