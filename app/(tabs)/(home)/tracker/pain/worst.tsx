import { ScaleSliderInput } from '@/components/tracker/ScaleSliderInput';
import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';

export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    <TrackerQuestionScreen title="My Pain">
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
    </TrackerQuestionScreen>
  );
}

