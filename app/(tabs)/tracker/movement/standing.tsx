import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export const STANDING_OPTIONS = [
  'I can stand as long as I want without increased pain',
  'I can stand as long as I want but increased my pain',
  'Pain prevents me standing more than one hour',
  'Pain prevents me standing more than 30 minutes',
  'Pain prevents me from standing more than 10 minutes',
  'Pain prevents me from standing at all',
];

// Roughly how many lines an option wraps to (about 34 characters per line at this font size).
const rowWeight = (text: string) => Math.max(1, Math.ceil(text.length / 34));

export default function StandingScreen() {
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(16),
    paddingBottom: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  promptText: {
    color: '#1D1B20',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
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
    borderRadius: scaleWidth(12),
    backgroundColor: '#FEF7FF',
    overflow: 'hidden',
    paddingHorizontal: scaleWidth(8),
  },
});
