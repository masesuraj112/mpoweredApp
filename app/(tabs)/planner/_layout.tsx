import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// The Care Planner's steps get the platform's header and back button; its home keeps the gradient.
// The known titles are set here, so they show from the first frame.
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="appointment-details" options={{ title: 'Plan My Appointment' }} />
      <Stack.Screen name="questions" options={{ title: 'Add Questions for My Appointment' }} />
      <Stack.Screen name="review" options={{ title: 'Review My Appointment Plan' }} />
      <Stack.Screen name="consent" options={{ title: 'Ask for Recording Consent' }} />
      <Stack.Screen name="support-person" options={{ title: 'Add a Support Person' }} />
      <Stack.Screen name="explore-questions" options={{ title: 'Questions Generated for Me' }} />
    </Stack>
  );
}
