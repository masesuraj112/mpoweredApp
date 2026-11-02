import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { STANDING_OPTIONS } from '@/features/assessments/movement/options';


import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
// Roughly how many lines an option wraps to (about 34 characters per line at this font size).
const rowWeight = (text: string) => Math.max(1, Math.ceil(text.length / 34));

export default function StandingScreen() {
  const styles = useStyles();
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.standingImpact) {
      return;
    }

    router.push('/tracker/movement/reflection');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="Standing Impacts"
          prompt={
            <Text style={styles.promptText}>
              Select the <Text style={styles.promptUnderline}>MOST</Text> relevant statement:
            </Text>
          }
          questionNumber={6}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/sitting')}
          onRecord={handleNext}
          disabled={!answers.standingImpact}
          variant="management"
          style={{ flex: 1, height: undefined }}
        >
          <View style={styles.optionsList}>
            {STANDING_OPTIONS.map((option, index) => (
              <AssessmentRadioRow
                key={option}
                label={option}
                selected={answers.standingImpact === option}
                onPress={() => updateAnswer('standingImpact', option)}
                weight={rowWeight(option)}
                isLast={index === STANDING_OPTIONS.length - 1}
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
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
    paddingHorizontal: Spacing.three,
  },
}));
