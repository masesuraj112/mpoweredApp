import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { LIFTING_OPTIONS } from '@/features/assessments/movement/options';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
// Roughly how many lines an option wraps to (about 36 characters per line at this font size).
const rowWeight = (text: string) => Math.max(1, Math.ceil(text.length / 36));

export default function LiftingScreen() {
  const styles = useStyles();
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.liftingImpact) {
      return;
    }

    router.push('/tracker/movement/sitting');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="Lifting Impacts"
          prompt={
            <Text style={styles.promptText}>
              Select the <Text style={styles.promptUnderline}>MOST</Text> relevant statement:
            </Text>
          }
          questionNumber={4}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/walking')}
          onRecord={handleNext}
          disabled={!answers.liftingImpact}
          variant="management"
          style={{ flex: 1, height: undefined }}
        >
          <View style={styles.optionsList}>
            {LIFTING_OPTIONS.map((option, index) => (
              <AssessmentRadioRow
                key={option}
                label={option}
                selected={answers.liftingImpact === option}
                onPress={() => updateAnswer('liftingImpact', option)}
                weight={rowWeight(option)}
                isLast={index === LIFTING_OPTIONS.length - 1}
                textStyle={styles.optionText}
              />
            ))}
          </View>
        </ChoiceCard>
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
    paddingBottom: Spacing.three,
  },
  pageTitle: {
    ...Typography.title,
    color: colors.text,
    marginLeft: Spacing.two,
    marginBottom: Spacing.three,
  },
  promptText: {
    color: colors.text,
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  promptUnderline: {
    textDecorationLine: 'underline',
  },
  optionsList: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignSelf: 'center',
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    paddingHorizontal: Spacing.three,
  },
  // Lifting has the longest options, so it uses a smaller size than the other screens.
  optionText: {
    ...Typography.caption,
  },
}));
