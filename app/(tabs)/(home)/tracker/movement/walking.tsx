import { ChoiceList } from '@/components/mpowered/ChoiceRow';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text } from 'react-native';

export const WALKING_OPTIONS = [
  'Pain does not prevent me walking any distance',
  'Pain prevents me from walking more than 2 kilometres',
  'Pain prevents me from walking more than 1 kilometres',
  'Pain prevents me from walking more than 500 metres',
  'I can only walk using a stick or crutches',
  'I am in bed most of the time',
];


export default function WalkingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.walkingImpact) {
      return;
    }

    router.push('/tracker/movement/lifting');
  };

  return (
    <AssessmentScreen title="My Movement">
      <ChoiceCard
        title="Walking Impacts"
        prompt={
          <QuestionPrompt>
            Select the <Text style={{ textDecorationLine: 'underline' }}>MOST</Text> relevant statement:
          </QuestionPrompt>
        }
        questionNumber={3}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/general')}
        onRecord={handleNext}
        disabled={!answers.walkingImpact}
        variant="management"
      >
        <ChoiceList>
          {WALKING_OPTIONS.map((option, index) => (
            <AssessmentRadioRow
              key={option}
              label={option}
              selected={answers.walkingImpact === option}
              onPress={() => updateAnswer('walkingImpact', option)}
              isLast={index === WALKING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceList>
      </ChoiceCard>
    </AssessmentScreen>
  );
}

