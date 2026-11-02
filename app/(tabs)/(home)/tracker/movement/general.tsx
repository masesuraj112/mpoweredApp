import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { GENERAL_IMPACT_OPTIONS } from '@/features/assessments/movement/options';

import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
const rowWeight = (text: string) => Math.max(1, Math.ceil(text.length / 34));

export default function GeneralScreen() {
  const styles = useStyles();
  const { answers, updateAnswer } = useMovementAssessment();
  const selected = answers.generalImpacts ?? [];
  

  const toggle = (option: string) => {
    const next = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    updateAnswer('generalImpacts', next);
  };

  const handleNext = () => {
   if (selected.length === 0) {
     return;
    }
   router.push('/tracker/movement/walking');
 };




return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <ChoiceCard
          title="General Movement Impacts"
          prompt={
            <Text style={styles.promptText}>
              Select <Text style={styles.promptUnderline}>ALL</Text> relevant statements:
            </Text>
          }
          questionNumber={2}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/activity')}
          onRecord={handleNext}
          disabled={selected.length === 0}
          variant="management"
          style={{ flex: 1, height: undefined }}
        >
          <View style={styles.optionsList}>
            {GENERAL_IMPACT_OPTIONS.map((option, index) => {
              const isSelected = selected.includes(option);
              const isLast = index === GENERAL_IMPACT_OPTIONS.length - 1;

              return (
                <Pressable
                  key={option}
                  onPress={() => toggle(option)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={option}
                  style={[styles.optionRow, !isLast && styles.optionDivider]}
                >
                  <Text style={styles.optionText}>
                    {option}
                  </Text>
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
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
  optionRow: {
    flex: 1,
    minHeight: 0,
    paddingVertical: 0,
    justifyContent: 'center',
    paddingLeft: Spacing.one,
    paddingRight: Spacing.five,  // room for the 18pt checkbox plus a gap
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionText: {
    color: colors.text,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  checkbox: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -9,
    width: 18,
    height: 18,
    borderWidth: 2,
    borderColor: colors.outlineStrong,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkmark: {
    color: colors.onPrimary,
    ...Typography.caption,
    fontWeight: '700',
  },
}));