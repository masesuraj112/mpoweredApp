import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { PAIN_CHARACTERISTICS_OPTIONS } from '@/constants/painCharacteristics';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';
import { useState } from 'react';

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
    router.dismissTo('/tracker/pain/location');
  };

  return (
    <AssessmentScreen title="My Pain">
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
        variant="painTracker"
        searchEnabled
        selectedChipsEnabled={false}
      />
    </AssessmentScreen>
  );
}
