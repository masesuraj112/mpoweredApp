import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceOptionList } from '@/components/tracker/ChoiceOptionList';
import { ChoicePrompt, PromptEmphasis } from '@/components/tracker/ChoicePrompt';
import { RadioOptionRow } from '@/components/tracker/RadioOptionRow';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
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
    <TrackerQuestionScreen title="My Movement">
      <ChoiceCard
        title="Lifting Impacts"
        prompt={
          <ChoicePrompt>
            Select the <PromptEmphasis>MOST</PromptEmphasis> relevant statement:
          </ChoicePrompt>
        }
        questionNumber={4}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/walking')}
        onRecord={handleNext}
        disabled={!answers.liftingImpact}
        variant="management"
      >
        <ChoiceOptionList>
          {LIFTING_OPTIONS.map((option, index) => (
            <RadioOptionRow
              key={option}
              label={option}
              selected={answers.liftingImpact === option}
              onPress={() => updateAnswer('liftingImpact', option)}
              isLast={index === LIFTING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceOptionList>
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

