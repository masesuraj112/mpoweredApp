import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { ChoiceCard } from '@/components/tracker/ChoiceCard';
import { ChoicePrompt } from '@/components/tracker/ChoicePrompt';
import { ChoiceTextInput } from '@/components/tracker/ChoiceTextInput';
import { useManagementAssessment } from '@/features/assessments/management/context';
import { router } from 'expo-router';

export default function OtcScreen() {
  const { answers, updateAnswer } = useManagementAssessment();

  return (
    <TrackerQuestionScreen title="My Management">
      <ChoiceCard
        title="Medication"
        prompt={
          <ChoicePrompt note="Not taking OTC medications? Just click the record button">
            Over the past week, did you consume any over the counter (OTC) medication.
          </ChoicePrompt>
        }
        questionNumber={2}
        totalQuestions={4}
        onPrevious={() => router.dismissTo('/tracker/management/medication')}
        onRecord={() => router.push('/tracker/management/exercise')}
        variant="management"
      >
        <ChoiceTextInput
          accessibilityLabel="Over the counter medication name"
          value={answers.otcMedication ?? ''}
          onChangeText={value => updateAnswer('otcMedication', value)}
          placeholder="Input name of over the counter medication"
        />
      </ChoiceCard>
    </TrackerQuestionScreen>
  );
}

