import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceOptionList } from '@/components/tracker/ChoiceOptionList';
import { ChoicePrompt, PromptEmphasis } from '@/components/tracker/ChoicePrompt';
import { RadioOptionRow } from '@/components/tracker/RadioOptionRow';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';

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
    <TrackerQuestionScreen title="My Movement">
      <ChoiceCard
        title="Walking Impacts"
        prompt={
          <ChoicePrompt>
            Select the <PromptEmphasis>MOST</PromptEmphasis> relevant statement:
          </ChoicePrompt>
        }
        questionNumber={3}
        totalQuestions={7}
        onPrevious={() => router.push('/tracker/movement/general')}
        onRecord={handleNext}
        disabled={!answers.walkingImpact}
        variant="management"
      >
        <ChoiceOptionList>
          {WALKING_OPTIONS.map((option, index) => (
            <RadioOptionRow
              key={option}
              label={option}
              selected={answers.walkingImpact === option}
              onPress={() => updateAnswer('walkingImpact', option)}
              isLast={index === WALKING_OPTIONS.length - 1}
            />
          ))}
        </ChoiceOptionList>
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

