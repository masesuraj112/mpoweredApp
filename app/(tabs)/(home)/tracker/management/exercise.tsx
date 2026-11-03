import { ChoiceList, ChoiceRow } from '@/components/mpowered/ChoiceRow';
import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ChoiceCard, QuestionHint, QuestionPrompt } from '@/components/mpowered/ChoiceCard';
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
    <AssessmentScreen title="My Management">
      <ChoiceCard
        title="Exercise"
        prompt={
          <>
            <QuestionPrompt>
              In the past 7 days, did you perform any exercises to manage your musculoskeletal pain or improve your movement?
            </QuestionPrompt>
            <QuestionHint>
              Examples: walking, stretching, strengthening, yoga, resistance band work, or balance exercises.
            </QuestionHint>
          </>
        }
        questionNumber={3}
        totalQuestions={4}
        onPrevious={() => router.push('/tracker/management/otc')}
        onRecord={handleNext}
        disabled={!answers.exerciseDays}
        variant="management"
      >
        <ChoiceList>
          {EXERCISE_OPTIONS.map((option, index) => (
            <ChoiceRow
              key={option}
              kind="radio"
              label={option}
              selected={answers.exerciseDays === option}
              onPress={() => updateAnswer('exerciseDays', option)}
              isLast={index === EXERCISE_OPTIONS.length - 1}
            />
          ))}
        </ChoiceList>
      </ChoiceCard>
    </AssessmentScreen>
  );
}

