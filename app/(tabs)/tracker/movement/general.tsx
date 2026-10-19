import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChoiceCard } from '@/components/mpowered/ChoiceCard';
import { GENERAL_IMPACT_OPTIONS } from '@/features/assessments/movement/options';

const rowWeight = (text: string) => Math.max(1, Math.ceil(text.length / 34));

export default function GeneralScreen() {
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
                  <Text style={styles.optionText} allowFontScaling={false}>
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
    justifyContent: 'center',
    paddingLeft: scaleWidth(4),
    paddingRight: scaleWidth(34),  // room for the 18pt checkbox plus a gap
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  optionText: {
    color: '#1D1B20',
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
  },
  checkbox: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -scaleWidth(9),
    width: scaleWidth(18),
    height: scaleWidth(18),
    borderWidth: 2,
    borderColor: '#49454F',
    borderRadius: scaleWidth(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#5B4A9E',
    backgroundColor: '#5B4A9E',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: scaleFont(12),
    fontWeight: '700',
  },
});