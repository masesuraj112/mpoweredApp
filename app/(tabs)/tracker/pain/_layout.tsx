import { PainAssessmentProvider } from '@/features/assessments/pain/context';
import { TrackerHeader } from '@/components/tracker/TrackerHeader';
import { Stack } from 'expo-router';

export default function PainLayout() {
  return (
    <PainAssessmentProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <TrackerHeader />,
        }}
      >
        <Stack.Screen name="summary" options={{ headerShown: false }} />
      </Stack>
    </PainAssessmentProvider>
  );
}