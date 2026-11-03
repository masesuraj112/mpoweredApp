import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoiceOptionList } from '@/components/tracker/ChoiceOptionList';
import { ChoicePrompt } from '@/components/tracker/ChoicePrompt';
import { RadioOptionRow } from '@/components/tracker/RadioOptionRow';
import { EXERCISE_OPTIONS } from '@/constants/managementOptions';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { router } from 'expo-router';

export default function ExerciseScreen() {
  const { answers, updateAnswer } = useManagementAssessment();
  const handleNext = () => {
    if (!answers.exerciseDays) {
      return;
    }

    router.push('/tracker/management/emotion');
  };

  return (
    <TrackerQuestionScreen title="My Management">
      <ChoiceCard
        title="Exercise"
        prompt={
          <ChoicePrompt note="Examples: walking, stretching, strengthening, yoga, resistance band work, or balance exercises.">
            In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?
          </ChoicePrompt>
        }
        questionNumber={3}
        totalQuestions={4}
        onPrevious={() => router.dismissTo('/tracker/management/otc')}
        onRecord={handleNext}
        disabled={!answers.exerciseDays}
        variant="management"
      >
        <ChoiceOptionList>
          {EXERCISE_OPTIONS.map((option, index) => (
            <RadioOptionRow
              key={option}
              label={option}
              selected={answers.exerciseDays === option}
              onPress={() => updateAnswer('exerciseDays', option)}
              isLast={index === EXERCISE_OPTIONS.length - 1}
            />
          ))}
        </ChoiceOptionList>
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

