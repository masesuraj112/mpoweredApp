import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { SingleChoiceInput } from '@/components/tracker/SingleChoiceInput';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { router } from 'expo-router';
import { SLEEPING_OPTIONS } from '@/features/assessments/personal-care/options';

export default function SleepingScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const savedIndex = SLEEPING_OPTIONS.indexOf(answers.sleepingLevel ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }

    router.push('/tracker/personal-care/reflection');
  };

  return (
    <TrackerQuestionScreen title="My Personal Care">
      <SingleChoiceInput
        titleText="Sleeping"
        questionNumber={3}
        totalQuestions={4}
        options={SLEEPING_OPTIONS}
        selectedIndex={selectedIndex}
        onSelectionChange={index => updateAnswer('sleepingLevel', SLEEPING_OPTIONS[index])}
        onPrevious={() => router.push('/tracker/personal-care/care')}
        onRecord={handleNext}
        variant="personalCare"
      />
    </TrackerQuestionScreen>
  );
}

