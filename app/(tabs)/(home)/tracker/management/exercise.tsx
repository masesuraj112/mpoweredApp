import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { EXERCISE_OPTIONS } from '@/constants/managementOptions';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
export default function ExerciseScreen() {
  const styles = useStyles();
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
          cardHeight={516}
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
  promptContent: {
    gap: Spacing.two,
  },
  promptText: {
    color: colors.text,
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  examples: {
    color: colors.textSecondary,
    ...Typography.caption,
    fontStyle: 'italic',
  },
  optionsList: {
    width: '96%',
    alignSelf: 'center',
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: Spacing.three,
  },
  optionRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  radio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.outlineStrong,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: colors.primary,
  },
  optionText: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '500',
    letterSpacing: 0.25,
  },
}));
