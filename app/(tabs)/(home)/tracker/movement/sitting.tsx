import { ChoiceList } from '@/components/mpowered/ChoiceRow';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { SITTING_OPTIONS } from '@/features/assessments/movement/options';


export default function SittingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.sittingImpact) {
      return;
    }

    router.push('/tracker/movement/standing');
  };

  return (
    <AssessmentScreen title="My Movement">
      <ChoiceCard
        title="Sitting Impacts"
        prompt={
          <QuestionPrompt>
            Select the <Text style={{ textDecorationLine: 'underline' }}>MOST</Text> relevant statement:
          </QuestionPrompt>
        }
        questionNumber={5}
        totalQuestions={7}
        onPrevious={() => router.push('/tracker/movement/lifting')}
        onRecord={handleNext}
        disabled={!answers.sittingImpact}
        variant="management"
      >
        <ChoiceList>
          {SITTING_OPTIONS.map((option, index) => (
            <AssessmentRadioRow
              key={option}
              label={option}
              selected={answers.sittingImpact === option}
              onPress={() => updateAnswer('sittingImpact', option)}
              isLast={index === SITTING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceList>
      </ChoiceCard>
    </AssessmentScreen>
  );
}

