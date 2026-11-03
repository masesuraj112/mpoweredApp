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
        underLinedText="current pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={3}
        totalQuestions={6}
        initialValue={answers.currentPain ?? 0}
        onValueChange={value => updateAnswer('currentPain', value)}
        onPrevious={() => router.dismissTo('/tracker/pain/characteristics')}
        onRecord={() => {
          // an untouched slider never writes an answer, so write the value shown
          updateAnswer('currentPain', answers.currentPain ?? 0);
          router.push('/tracker/pain/mildest');
        }}
        variant="painTracker"
      />
    </AssessmentScreen>
  );
}

