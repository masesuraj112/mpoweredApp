import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export const SITTING_OPTIONS = [
  'I can sit in any chair as long as I like',
  'I can only sit in my favourite chair as long as I like',
  'Pain prevents me sitting more than one hour',
  'Pain prevents me sitting more than 30 minutes',
  'Pain prevents me from sitting more than 10 minutes',
  'Pain prevents me from sitting at all',
];

export default function SittingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.sittingImpact) {
      return;
    }

    router.push('/tracker/movement/standing');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="Sitting Impacts"
          prompt={
            <Text style={styles.promptText}>
              Select the <Text style={styles.promptUnderline}>MOST</Text> relevant statement:
            </Text>
          }
          questionNumber={5}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/lifting')}
          onRecord={handleNext}
          disabled={!answers.sittingImpact}
          variant="management"
          style={{ flex: 1, height: undefined }}
        >
          <View style={styles.optionsList}>
            {SITTING_OPTIONS.map((option, index) => {
              const isSelected = answers.sittingImpact === option;
              const isLast = index === SITTING_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option}
                  onPress={() => updateAnswer('sittingImpact', option)}
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
    paddingHorizontal: scaleWidth(12),
    overflow: 'hidden',
  },
  optionRow: {
    flex: 1,
    minHeight: 0,
    paddingVertical: scaleHeight(2),
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
  optionText: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
    color: '#1D1B20',
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
    letterSpacing: 0.25,
  },
});