import { AssessmentScreen } from '@/components/mpowered/AssessmentScreen';
import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';


export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    <AssessmentScreen title="My Pain">
      {/* input component goes here */}      
      <ScaleSliderInput
        underLinedText="worst pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={5}
        totalQuestions={6}
        initialValue={answers.worstPain ?? 0}
        onValueChange={value => updateAnswer('worstPain', value)}
        onPrevious={() => router.dismissTo('/tracker/pain/mildest')}
        onRecord={() => {
          // an untouched slider never writes an answer, so write the value shown
          updateAnswer('worstPain', answers.worstPain ?? 0);
          router.push('/tracker/pain/average');
        }}
        variant="painTracker"
      />
    </AssessmentScreen>
  );
}

