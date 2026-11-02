import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { TRAVELLING_OPTIONS } from '@/constants/socialHealthOptions';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { makeStyles, Spacing, Typography } from '@/constants/theme';
// SingleChoiceInput takes a mutable string[]
const SOCIAL_HEALTH_OPTIONS: string[] = [...TRAVELLING_OPTIONS];

export default function TravellingScreen() {
  const styles = useStyles();
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
          scrollable={false}
          cardHeight={558}
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
