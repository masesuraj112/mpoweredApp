import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleHeight } from '@/services/scale';
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
    <AssessmentScreen title="My Social Health">
      <ScaleSliderInput
        titleText="Mood"
        questionText="Over the past week, how much has pain impacted your mood?"
        assessmentType="mood"
        questionNumber={3}
        totalQuestions={7}
        initialValue={answers.moodNumber ?? 0}
        onValueChange={value => updateAnswer('moodNumber', value)}
        onPrevious={() => router.push('/tracker/social-health/travelling')}
        onRecord={handleNext}
        variant="personalCare"
        cardHeight={scaleHeight(330)}
      />
    </AssessmentScreen>
  );
}
