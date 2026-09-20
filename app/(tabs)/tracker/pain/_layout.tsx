import { PainAssessmentProvider } from '@/features/assessments/pain/context';
import { Stack } from 'expo-router';

export default function PainLayout() {
  return (
    <PainAssessmentProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </PainAssessmentProvider>
  );
}