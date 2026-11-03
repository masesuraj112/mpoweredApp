import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { SingleChoiceInput } from '@/components/tracker/SingleChoiceInput';
import { usePersonalCareAssessment } from '@/features/assessments/personal-care/context';
import { router } from 'expo-router';
import { PERSONAL_CARE_OPTIONS } from '@/features/assessments/personal-care/options';

export default function CareScreen() {
  const { answers, updateAnswer } = usePersonalCareAssessment();
  const savedIndex = PERSONAL_CARE_OPTIONS.indexOf(answers.personalCareLevel ?? '');
  const selectedIndex = savedIndex >= 0 ? savedIndex : null;

  const handleNext = () => {
    if (selectedIndex === null) {
      return;
    }

    router.push('/tracker/personal-care/sleeping');
  };

  return (
    <TrackerQuestionScreen title="My Personal Care">
      <SingleChoiceInput
        titleText="Personal care (washing, dressing, etc)"
        questionNumber={2}
        totalQuestions={4}
        options={PERSONAL_CARE_OPTIONS}
        selectedIndex={selectedIndex}
        onSelectionChange={index => updateAnswer('personalCareLevel', PERSONAL_CARE_OPTIONS[index])}
        onPrevious={() => router.dismissTo('/tracker/personal-care/general')}
        onRecord={handleNext}
        variant="personalCare"
      />
    </TrackerQuestionScreen>
  );
}

