import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ScaleSliderInput } from '@/components/tracker/ScaleSliderInput';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { router } from 'expo-router';

export default function MoodScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();

  const handleNext = () => {
    // The slider starts at 0, so record 0 if the user moves on without changing it.
    if (answers.moodNumber === undefined) {
      updateAnswer('moodNumber', 0);
    }
    router.push('/tracker/social-health/relationships');
  };

  return (
    <TrackerQuestionScreen title="My Social Health">
      <ScaleSliderInput
        titleText="Mood"
        questionText="Over the past week, how much has pain impacted your mood?"
        assessmentType="mood"
        questionNumber={3}
        totalQuestions={7}
        initialValue={answers.moodNumber ?? 0}
        onValueChange={value => updateAnswer('moodNumber', value)}
        onPrevious={() => router.dismissTo('/tracker/social-health/travelling')}
        onRecord={handleNext}
        variant="personalCare"
      />
    </TrackerQuestionScreen>
  );
}
