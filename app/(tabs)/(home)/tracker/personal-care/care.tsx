import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { PERSONAL_CARE_OPTIONS } from '@/features/assessments/personal-care/options';


import { makeStyles, Spacing, Typography } from '@/constants/theme';
export default function CareScreen() {
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  pageTitle: {
    ...Typography.title,
    color: colors.text,
    marginLeft: Spacing.two,
    marginBottom: Spacing.three,
  },
}));
