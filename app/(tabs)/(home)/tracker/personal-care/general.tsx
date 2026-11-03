import { QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { router } from 'expo-router';
import { Text } from 'react-native';
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
    <AssessmentScreen title="My Personal Care">
      <MultiChoiceList
        title="General Activities Impacts"
        prompt={
          <QuestionPrompt>
            Select <Text style={{ textDecorationLine: 'underline' }}>ALL</Text> relevant statements:
          </QuestionPrompt>
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
    </AssessmentScreen>
  );
}

