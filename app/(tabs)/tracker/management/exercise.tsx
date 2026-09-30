import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const EXERCISE_OPTIONS = ['0 days', '1–2 days', '3–4 days', '5–6 days', '7 days'];

export default function ExerciseScreen() {
  const { answers, updateAnswer } = useManagementAssessment();
  const handleNext = () => {
    if (!answers.exerciseDays) {
      return;
    }

    router.push('/tracker/management/emotion');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Management</Text>
        <ChoiceCard
          title="Exercise"
          prompt={
            <View style={styles.promptContent}>
              <Text style={styles.promptText}>
                In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?
              </Text>
              <Text style={styles.examples}>
                Examples: walking, stretching, strengthening, yoga, resistance band work, or balance exercises.
              </Text>
            </View>
          }
          questionNumber={3}
          totalQuestions={4}
          onPrevious={() => router.push('/tracker/management/otc')}
          onRecord={handleNext}
          disabled={!answers.exerciseDays}
          variant="management"
          cardHeight={scaleHeight(516)}
        >
          <View style={styles.optionsList}>
            {EXERCISE_OPTIONS.map((option, index) => {
              const isSelected = answers.exerciseDays === option;
              const isLast = index === EXERCISE_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option}
                  onPress={() => updateAnswer('exerciseDays', option)}
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
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(7),
    marginBottom: scaleHeight(18),
  },
  promptContent: {
    gap: scaleHeight(12),
  },
  promptText: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  examples: {
    color: '#727272',
    fontSize: scaleFont(12),
    fontStyle: 'italic',
    lineHeight: scaleHeight(18),
  },
  optionsList: {
    width: '96%',
    alignSelf: 'center',
    borderRadius: scaleWidth(12),
    backgroundColor: '#FEF7FF',
    paddingHorizontal: scaleWidth(16),
  },
  optionRow: {
    minHeight: scaleHeight(56),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(16),
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
    color: '#1D1B20',
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
    letterSpacing: 0.25,
  },
});
