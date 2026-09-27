import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const PAIN_CHARACTERISTICS_OPTIONS = [
  'Shooting',
  'Stabbing',
  'Gnawing',
  'Sharp',
  'Tender',
  'Burning',
  'Exhausting',
] as const;

export default function PainCharacteristicsScreen() {
  const { answers, updateAnswer } = usePainAssessment();
  const [selected, setSelected] = useState<number[]>(() =>
    PAIN_CHARACTERISTICS_OPTIONS.reduce<number[]>((indices, option, index) => {
      if (answers.characteristics?.includes(option)) {
        indices.push(index);
      }
      return indices;
    }, []),
  );

  const handleSelectionChange = (nextSelected: number[]) => {
    setSelected(nextSelected);
  };

  const saveSelection = () => {
    updateAnswer(
      'characteristics',
      selected.map(index => PAIN_CHARACTERISTICS_OPTIONS[index]),
    );
  };

  const handleNext = () => {
    if (selected.length === 0) {
      return;
    }

    saveSelection();
    router.push('/tracker/pain/current');
  };

  const handlePrevious = () => {
    saveSelection();
    router.push('/tracker/pain/location');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Pain</Text>
        <MultiChoiceList
          title="Pain characteristics"
          prompt="For each following words, check if that adjectives applies to your pain."
          subPrompt="(scroll down for more options)"
          options={[...PAIN_CHARACTERISTICS_OPTIONS]}
          selectedIndices={selected}
          onSelectionChange={handleSelectionChange}
          questionNumber={2}
          totalQuestions={6}
          onRecord={handleNext}
          onPrevious={handlePrevious}
          disabled={selected.length === 0}
          cardHeight={scaleHeight(599)}
          variant="painTracker"
          searchEnabled
          scrollable
          selectedChipsEnabled={false}
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
    paddingHorizontal: scaleWidth(22),
    paddingTop: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(9),
    marginBottom: scaleHeight(18),
  },
});