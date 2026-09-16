import { Stack } from 'expo-router';
import { PainAssessmentProvider } from '@/features/assessments/pain/context';
import { PAIN_STEPS } from '@/features/assessments/pain/steps';
import { AssessmentProgressHeader } from '@/components/mpowered/AssessmentProgressHeader';

export default function PainLayout() {
  return (
    <PainAssessmentProvider>
      <Stack
        screenOptions={{
          header: () => <AssessmentProgressHeader steps={PAIN_STEPS} title="Pain Assessment" />,
        }}
      />
    </PainAssessmentProvider>
  );
}