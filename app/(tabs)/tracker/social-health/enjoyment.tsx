import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleHeight } from '@/services/scale';
import { router } from 'expo-router';

export default function EnjoymentScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();

  const handleNext = () => {
    // The slider starts at 0, so record 0 if the user moves on without changing it.
    if (answers.enjoymentOfLife === undefined) {
      updateAnswer('enjoymentOfLife', 0);
    }
    router.push('/tracker/social-health/mood-emotion');
  };

  return (
    <AssessmentScreen title="My Social Health">
      <ScaleSliderInput
        titleText="Enjoyment of life"
        questionText="Over the past week, how much has pain impacted your ability to enjoy life?"
        assessmentType="enjoyment"
        questionNumber={5}
        totalQuestions={7}
        initialValue={answers.enjoymentOfLife ?? 0}
        onValueChange={value => updateAnswer('enjoymentOfLife', value)}
        onPrevious={() => router.push('/tracker/social-health/relationships')}
        onRecord={handleNext}
        variant="personalCare"
        cardHeight={scaleHeight(330)}
      />
    </AssessmentScreen>
  );
}
