import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const LIFTING_OPTIONS = [
  'I can lift heavy weights without extra pain',
  'I can lift heavy weights but it gives extra pain',
  'I struggle to lift heavy weights off the floor, but I can lift them from a table',
  'I struggle to lift heavy weights off the floor, but I can lift medium weights on the table',
  'I can lift very light weights',
  'I cannot lift or carry anything at all',
];

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
            {LIFTING_OPTIONS.map((option, index) => {
              const isSelected = answers.liftingImpact === option;
              const isLast = index === LIFTING_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option}
                  onPress={() => updateAnswer('liftingImpact', option)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={option}
                  style={[styles.optionRow, !isLast && styles.optionDivider]}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.optionText}>{option}</Text>
                </Pressable>
              );
            })}
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
    paddingHorizontal: scaleWidth(8),
  },
  optionRow: {
    flex: 1,
    minHeight: 0,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(10),
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  radio: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    borderWidth: 2,
    borderColor: '#49454F',
    borderRadius: scaleWidth(10),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioSelected: {
    borderColor: '#5B4A9E',
  },
  radioDot: {
    width: scaleWidth(10),
    height: scaleWidth(10),
    borderRadius: scaleWidth(5),
    backgroundColor: '#5B4A9E',
  },
  optionText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    paddingRight: scaleWidth(6),
    color: '#1D1B20',
    fontSize: scaleFont(13),
    fontWeight: '500',
    lineHeight: scaleHeight(18),
  },
});