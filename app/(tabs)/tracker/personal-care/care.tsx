import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { PERSONAL_CARE_OPTIONS } from '@/features/assessments/personal-care/options';


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
