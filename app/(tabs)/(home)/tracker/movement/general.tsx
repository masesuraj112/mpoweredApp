import { ChoiceList, ChoiceRow } from '@/components/mpowered/ChoiceRow';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { ChoiceCard, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { GENERAL_IMPACT_OPTIONS } from '@/features/assessments/movement/options';


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
    <AssessmentScreen title="My Movement">
      <ChoiceCard
        title="General Movement Impacts"
        prompt={
          <QuestionPrompt>
            Select <Text style={{ textDecorationLine: 'underline' }}>ALL</Text> relevant statements:
          </QuestionPrompt>
        }
        questionNumber={2}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/activity')}
        onRecord={handleNext}
        disabled={selected.length === 0}
        variant="management"
      >
        <ChoiceList>
          {GENERAL_IMPACT_OPTIONS.map((option, index) => (
            <ChoiceRow
              key={option}
              kind="checkbox"
              label={option}
              selected={selected.includes(option)}
              onPress={() => toggle(option)}
              isLast={index === GENERAL_IMPACT_OPTIONS.length - 1}
            />
          ))}
        </ChoiceList>
      </ChoiceCard>
    </AssessmentScreen>
  );
}
