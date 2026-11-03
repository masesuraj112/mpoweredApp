import { MovementAssessmentProvider } from '@/features/assessments/movement/context';
import { Stack } from 'expo-router';

export default function MovementLayout() {
  return (
    // Keep assessment answers alive while navigating between these routes.
    <MovementAssessmentProvider>
      <Stack
        screenOptions={{ headerShown: false }}
      />
    </MovementAssessmentProvider>
  );
}
