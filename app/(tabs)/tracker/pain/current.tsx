import { ScaleSliderInput } from '@/components/tracker/ScaleSliderInput';
import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';

export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    <TrackerQuestionScreen title="My Pain">
<ScaleSliderInput
        underLinedText="current pain"
        titleText="Pain Intensity"
        assessmentType="pain"
        questionNumber={3}
        totalQuestions={6}
        initialValue={answers.currentPain ?? 0}
        onValueChange={value => updateAnswer('currentPain', value)}
        onPrevious={() => router.push('/tracker/pain/characteristics')}
        onRecord={() => {
          // an untouched slider never writes an answer, so write the value shown
          updateAnswer('currentPain', answers.currentPain ?? 0);
          router.push('/tracker/pain/mildest');
        }}
        variant="painTracker"
      />
    </TrackerQuestionScreen>
  );
}

