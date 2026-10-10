import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const WALKING_OPTIONS = [
  'Pain does not prevent me walking any distance',
  'Pain prevents me from walking more than 2 kilometres',
  'Pain prevents me from walking more than 1 kilometres',
  'Pain prevents me from walking more than 500 metres',
  'I can only walk using a stick or crutches',
  'I am in bed most of the time',
];

export default function WalkingScreen() {
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
            {WALKING_OPTIONS.map((option, index) => {
              const isSelected = answers.walkingImpact === option;
              const isLast = index === WALKING_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option}
                  onPress={() => updateAnswer('walkingImpact', option)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={option}
                  style={[styles.optionRow, !isLast && styles.optionDivider]}
                >
                  <View style={[styles.radio, isSelected && styles.radioSelected]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <View style={styles.optionTextWrap}>
                    <Text style={styles.optionText}>{option}</Text>
                  </View>
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
    overflow: 'hidden',
    paddingHorizontal: scaleWidth(8),
  },
  optionRow: {
    flex: 1,
    minHeight: 0,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(12),
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
  optionTextWrap: {
    flex: 1,
    minWidth: 0,
    paddingRight: scaleWidth(8),
    },
  optionText: {
    color: '#1D1B20',
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
  },
});