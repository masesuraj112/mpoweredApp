import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoicePrompt, PromptEmphasis } from '@/components/tracker/ChoicePrompt';
import { MultiChoiceList } from '@/components/tracker/MultiChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { router } from 'expo-router';
import { GENERAL_ACTIVITY_OPTIONS } from '@/features/assessments/personal-care/options';

export default function GeneralScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const savedActivities = answers.generalActivities ?? [];
  const selected = GENERAL_ACTIVITY_OPTIONS.reduce<number[]>((indices, activity, index) => {
    if (savedActivities.includes(activity)) {
      indices.push(index);
    }
    return indices;
  }, []);

  const handleSelectionChange = (selectedIndices: number[]) => {
    updateAnswer('generalActivities', selectedIndices.map(index => GENERAL_ACTIVITY_OPTIONS[index]));
  };

  const handleNext = () => {
    if (selected.length === 0) {
      return;
    }

    router.push('/tracker/personal-care/care');
  };

  return (
    <TrackerQuestionScreen title="My Personal Care">
      <MultiChoiceList
        title="General Activities Impacts"
        prompt={
          <ChoicePrompt>
            Select <PromptEmphasis>ALL</PromptEmphasis> relevant statements:
          </ChoicePrompt>
        }
        options={GENERAL_ACTIVITY_OPTIONS}
        selectedIndices={selected}
        onSelectionChange={handleSelectionChange}
        questionNumber={1}
        totalQuestions={4}
        onRecord={handleNext}
        disabled={selected.length === 0}
        variant="personalCare"
        searchEnabled={false}
        selectedChipsEnabled={false}
      />
    </TrackerQuestionScreen>
  );
}

