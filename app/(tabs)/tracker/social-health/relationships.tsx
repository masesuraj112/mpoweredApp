import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleHeight } from '@/services/scale';
import { router } from 'expo-router';

export default function RelationshipsScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();

  const handleNext = () => {
    // The slider starts at 0, so record 0 if the user moves on without changing it.
    if (answers.relationWithOthers === undefined) {
      updateAnswer('relationWithOthers', 0);
    }
    router.push('/tracker/social-health/enjoyment');
  };

  return (
    <AssessmentScreen title="My Social Health">
      <ScaleSliderInput
        titleText="Relation with others"
        questionText="Over the past week, how much has pain interfered with your relationships with other people?"
        assessmentType="relationships"
        questionNumber={4}
        totalQuestions={7}
        initialValue={answers.relationWithOthers ?? 0}
        onValueChange={value => updateAnswer('relationWithOthers', value)}
        onPrevious={() => router.push('/tracker/social-health/mood')}
        onRecord={handleNext}
        variant="personalCare"
        cardHeight={scaleHeight(330)}
      />
    </AssessmentScreen>
  );
}
