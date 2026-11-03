import { ScaleSliderInput } from '@/components/tracker/ScaleSliderInput';
import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';

export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    <TrackerQuestionScreen title="My Pain">
<ScaleSliderInput
        underLinedText="mildest pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={4}
        totalQuestions={6}
        initialValue={answers.mildestPain ?? 0}
        onValueChange={value => updateAnswer('mildestPain', value)}
        onPrevious={() => router.dismissTo('/tracker/pain/current')}
        onRecord={() => {
          // an untouched slider never writes an answer, so write the value shown
          updateAnswer('mildestPain', answers.mildestPain ?? 0);
          router.push('/tracker/pain/worst');
        }}
        variant="painTracker"
      />

    </TrackerQuestionScreen>
  );
}

