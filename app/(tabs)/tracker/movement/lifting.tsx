import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LIFTING_OPTIONS } from '@/features/assessments/movement/options';

// Roughly how many lines an option wraps to (about 36 characters per line at this font size).
const rowWeight = (text: string) => Math.max(1, Math.ceil(text.length / 36));

export default function LiftingScreen() {
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
  // Lifting has the longest options, so it uses a smaller size than the other screens.
  optionText: {
    fontSize: scaleFont(13),
    lineHeight: scaleHeight(18),
  },
});
