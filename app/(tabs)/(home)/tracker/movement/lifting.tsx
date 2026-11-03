import { ChoiceList } from '@/components/mpowered/ChoiceRow';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { LIFTING_OPTIONS } from '@/features/assessments/movement/options';


export default function LiftingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.liftingImpact) {
      return;
    }

    router.push('/tracker/movement/sitting');
  };

  return (
    <AssessmentScreen title="My Movement">
      <ChoiceCard
        title="Lifting Impacts"
        prompt={
          <QuestionPrompt>
            Select the <Text style={{ textDecorationLine: 'underline' }}>MOST</Text> relevant statement:
          </QuestionPrompt>
        }
        questionNumber={4}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/walking')}
        onRecord={handleNext}
        disabled={!answers.liftingImpact}
        variant="management"
      >
        <ChoiceList>
          {LIFTING_OPTIONS.map((option, index) => (
            <AssessmentRadioRow
              key={option}
              label={option}
              selected={answers.liftingImpact === option}
              onPress={() => updateAnswer('liftingImpact', option)}
              isLast={index === LIFTING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceList>
      </ChoiceCard>
    </AssessmentScreen>
  );
}

