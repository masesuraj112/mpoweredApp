import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceOptionList } from '@/components/tracker/ChoiceOptionList';
import { ChoicePrompt, PromptEmphasis } from '@/components/tracker/ChoicePrompt';
import { RadioOptionRow } from '@/components/tracker/RadioOptionRow';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
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
    <TrackerQuestionScreen title="My Movement">
      <ChoiceCard
        title="Standing Impacts"
        prompt={
          <ChoicePrompt>
            Select the <PromptEmphasis>MOST</PromptEmphasis> relevant statement:
          </ChoicePrompt>
        }
        questionNumber={6}
        totalQuestions={7}
        onPrevious={() => router.dismissTo('/tracker/movement/sitting')}
        onRecord={handleNext}
        disabled={!answers.standingImpact}
        variant="management"
      >
        <ChoiceOptionList>
          {STANDING_OPTIONS.map((option, index) => (
            <RadioOptionRow
              key={option}
              label={option}
              selected={answers.standingImpact === option}
              onPress={() => updateAnswer('standingImpact', option)}
              isLast={index === STANDING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceOptionList>
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

