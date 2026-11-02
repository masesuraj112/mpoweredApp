import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
export const WALKING_OPTIONS = [
  'Pain does not prevent me walking any distance',
  'Pain prevents me from walking more than 2 kilometres',
  'Pain prevents me from walking more than 1 kilometres',
  'Pain prevents me from walking more than 500 metres',
  'I can only walk using a stick or crutches',
  'I am in bed most of the time',
];

// Roughly how many lines an option wraps to (about 34 characters per line at this font size).
const rowWeight = (text: string) => Math.max(1, Math.ceil(text.length / 34));

export default function WalkingScreen() {
  const styles = useStyles();
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.walkingImpact) {
      return;
    }

    router.push('/tracker/movement/lifting');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="Walking Impacts"
          prompt={
            <Text style={styles.promptText}>
              Select the <Text style={styles.promptUnderline}>MOST</Text> relevant statement:
            </Text>
          }
          questionNumber={3}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/general')}
          onRecord={handleNext}
          disabled={!answers.walkingImpact}
          variant="management"
          style={{ flex: 1, height: undefined }}
        >
          <View style={styles.optionsList}>
            {WALKING_OPTIONS.map((option, index) => (
              <AssessmentRadioRow
                key={option}
                label={option}
                selected={answers.walkingImpact === option}
                onPress={() => updateAnswer('walkingImpact', option)}
                weight={rowWeight(option)}
                isLast={index === WALKING_OPTIONS.length - 1}
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
    ...Typography.display,
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
