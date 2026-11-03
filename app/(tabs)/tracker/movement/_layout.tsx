import { MovementAssessmentProvider } from '@/features/assessments/movement/context';
import { TrackerHeader } from '@/components/tracker/TrackerHeader';
import { Stack } from 'expo-router';

export default function MovementLayout() {
  return (
    // Keep assessment answers alive while navigating between these routes.
    <MovementAssessmentProvider>
      <Stack
        screenOptions={{
          headerShown: true,
          header: () => <TrackerHeader />,
        }}
      />
    </MovementAssessmentProvider>
  );
}
