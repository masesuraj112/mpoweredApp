import { ChoiceList } from '@/components/mpowered/ChoiceRow';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { AssessmentRadioRow } from '@/components/mpowered/AssessmentRadioRow';
import { ChoiceCard, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { Text } from 'react-native';
import { STANDING_OPTIONS } from '@/features/assessments/movement/options';



export default function StandingScreen() {
  const { answers, updateAnswer } = useMovementAssessment();

  const handleNext = () => {
    if (!answers.standingImpact) {
      return;
    }

    router.push('/tracker/movement/reflection');
  };

  return (
    <AssessmentScreen title="My Movement">
      <ChoiceCard
        title="Standing Impacts"
        prompt={
          <QuestionPrompt>
            Select the <Text style={{ textDecorationLine: 'underline' }}>MOST</Text> relevant statement:
          </QuestionPrompt>
        }
        questionNumber={6}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/sitting')}
        onRecord={handleNext}
        disabled={!answers.standingImpact}
        variant="management"
      >
        <ChoiceList>
          {STANDING_OPTIONS.map((option, index) => (
            <AssessmentRadioRow
              key={option}
              label={option}
              selected={answers.standingImpact === option}
              onPress={() => updateAnswer('standingImpact', option)}
              isLast={index === STANDING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceList>
      </ChoiceCard>
    </AssessmentScreen>
  );
}

