import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { SingleChoiceInput } from '@/components/tracker/SingleChoiceInput';
import { TRAVELLING_OPTIONS } from '@/constants/socialHealthOptions';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { router } from 'expo-router';

// SingleChoiceInput takes a mutable string[]
const SOCIAL_HEALTH_OPTIONS: string[] = [...TRAVELLING_OPTIONS];

export default function TravellingScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();
  const savedIndex = SOCIAL_HEALTH_OPTIONS.indexOf(answers.travel ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }
    router.push('/tracker/social-health/mood');
  };

  return (
    <TrackerQuestionScreen title="My Social Health">
      <SingleChoiceInput
        titleText="Travelling"
        questionNumber={2}
        totalQuestions={7}
        options={SOCIAL_HEALTH_OPTIONS}
        selectedIndex={selectedIndex}
        onSelectionChange={index => updateAnswer('travel', SOCIAL_HEALTH_OPTIONS[index])}
        onPrevious={() => router.push('/tracker/social-health/social-life')}
        onRecord={handleNext}
        variant="personalCare"
      />
    </TrackerQuestionScreen>
  );
}

