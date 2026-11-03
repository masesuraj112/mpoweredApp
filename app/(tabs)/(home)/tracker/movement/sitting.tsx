import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceOptionList } from '@/components/tracker/ChoiceOptionList';
import { ChoicePrompt, PromptEmphasis } from '@/components/tracker/ChoicePrompt';
import { RadioOptionRow } from '@/components/tracker/RadioOptionRow';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
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
    <TrackerQuestionScreen title="My Movement">
      <ChoiceCard
        title="Sitting Impacts"
        prompt={
          <ChoicePrompt>
            Select the <PromptEmphasis>MOST</PromptEmphasis> relevant statement:
          </ChoicePrompt>
        }
        questionNumber={5}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/lifting')}
        onRecord={handleNext}
        disabled={!answers.sittingImpact}
        variant="management"
      >
        <ChoiceOptionList>
          {SITTING_OPTIONS.map((option, index) => (
            <RadioOptionRow
              key={option}
              label={option}
              selected={answers.sittingImpact === option}
              onPress={() => updateAnswer('sittingImpact', option)}
              isLast={index === SITTING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceOptionList>
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

