import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SLEEPING_OPTIONS } from '@/features/assessments/personal-care/options';

import { makeStyles, Spacing, Typography } from '@/constants/theme';
export default function SleepingScreen() {
  const styles = useStyles();
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
    ...Typography.display,
    color: colors.text,
    marginLeft: Spacing.two,
    marginBottom: Spacing.three,
  },
}));
