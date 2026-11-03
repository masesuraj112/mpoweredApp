import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { useMovementAssessment } from '@/features/assessments/movement/context';
import { router } from 'expo-router';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { CheckboxOptionRow } from '@/components/tracker/CheckboxOptionRow';
import { ChoiceOptionList } from '@/components/tracker/ChoiceOptionList';
import { ChoicePrompt, PromptEmphasis } from '@/components/tracker/ChoicePrompt';
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
    <TrackerQuestionScreen title="My Movement">
      <ChoiceCard
        title="General Movement Impacts"
        prompt={
          <ChoicePrompt>
            Select <PromptEmphasis>ALL</PromptEmphasis> relevant statements:
          </ChoicePrompt>
        }
        questionNumber={2}
        totalQuestions={7}
        onPrevious={() => router.push('/tracker/movement/activity')}
        onRecord={handleNext}
        disabled={selected.length === 0}
        variant="management"
      >
        <ChoiceOptionList>
          {GENERAL_IMPACT_OPTIONS.map((option, index) => (
            <CheckboxOptionRow
              key={option}
              label={option}
              selected={selected.includes(option)}
              onPress={() => toggle(option)}
              isLast={index === GENERAL_IMPACT_OPTIONS.length - 1}
            />
          ))}
        </ChoiceOptionList>
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

