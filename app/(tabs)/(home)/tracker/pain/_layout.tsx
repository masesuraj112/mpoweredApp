import { PainAssessmentProvider } from '@/features/assessments/pain/context';
import { AssessmentHeader } from '@/components/mpowered/AssessmentHeader';
import { Stack } from 'expo-router';

export default function PainLayout() {
  return (
    <PainAssessmentProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <AssessmentHeader />,
        }}
      >
        <Stack.Screen name="summary" options={{ headerShown: false }} />
      </Stack>
    </PainAssessmentProvider>
  );
}