import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export const GENERAL_IMPACT_OPTIONS = [
  'I walk more slowly than usual because of my pain',
  'I lie down to rest more often because of my pain',
  'I only stand up for short periods of time because of my pain',
  'I try not to bend or kneel down because of my pain',
  'I find it difficult to get out of a chair because of my pain',
  'I sit down most of the day because of my pain',
];

export default function GeneralScreen() {
   const { answers, updateAnswer } = useMovementAssessment();
  const savedImpacts = answers.generalImpacts ?? [];
  const selected = GENERAL_IMPACT_OPTIONS.reduce<number[]>((indices, option, index) => {
    if (savedImpacts.includes(option)) {
      indices.push(index);
    }
    return indices;
  }, []);


const handleSelectionChange = (selectedIndices: number[]) => {
  updateAnswer('generalImpacts', selectedIndices.map(index => GENERAL_IMPACT_OPTIONS[index]));
};

return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Movement</Text>
        <MultiChoiceList
          title="General Movement Impacts"
          prompt={
            <Text style={styles.promptText}>
              Select <Text style={styles.promptUnderline}>ALL</Text> relevant statements:
            </Text>
          }
          options={GENERAL_IMPACT_OPTIONS}
          selectedIndices={selected}
          onSelectionChange={handleSelectionChange}
          questionNumber={2}
          totalQuestions={7}
          onPrevious={() => router.push('/tracker/movement/activity')}
          onRecord={() => router.push('/tracker/movement/walking')}
          disabled={selected.length === 0}
          variant="painTracker"
          searchEnabled={false}
          scrollable
          listHeight={scaleHeight(340)}
          selectedChipsEnabled={false}
          cardHeight={scaleHeight(516)}
        />
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
  promptText: {
    color: '#000000',
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
  },
  promptUnderline: {
    textDecorationLine: 'underline',
  },
});