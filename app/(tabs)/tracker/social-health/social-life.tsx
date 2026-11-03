import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { SingleChoiceInput } from '@/components/tracker/SingleChoiceInput';
import { SOCIAL_LIFE_OPTIONS } from '@/constants/socialHealthOptions';
import { useSocialHealthAssessment } from '@/features/assessments/social-health/context';
import { scaleHeight } from '@/services/scale';
import { router } from 'expo-router';

// SingleChoiceInput takes a mutable string[]
const SOCIAL_HEALTH_OPTIONS: string[] = [...SOCIAL_LIFE_OPTIONS];

export default function SocialLifeScreen() {
  const { answers, updateAnswer } = useSocialHealthAssessment();
  const savedIndex = SOCIAL_HEALTH_OPTIONS.indexOf(answers.socialLife ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }
    router.push('/tracker/social-health/travelling');
  };

  return (
    <TrackerQuestionScreen title="My Social Health">
      <SingleChoiceInput
        titleText="Social life"
        questionNumber={1}
        totalQuestions={7}
        options={SOCIAL_HEALTH_OPTIONS}
        selectedIndex={selectedIndex}
        onSelectionChange={index => updateAnswer('socialLife', SOCIAL_HEALTH_OPTIONS[index])}
        onRecord={handleNext}
        variant="personalCare"
      />
    </TrackerQuestionScreen>
  );
}

