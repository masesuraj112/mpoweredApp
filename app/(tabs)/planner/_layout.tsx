import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// The Care Planner's steps get the platform's header and back button; its home keeps the gradient.
// Large titles and the known titles are set here, before the first frame: iOS only lays out a large title
// that is on from the start (turned on later, it stays hidden until the page is scrolled).
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerLargeTitle: true, headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="appointment-details" options={{ title: 'Plan My Appointment' }} />
      <Stack.Screen name="questions" options={{ title: 'Add Questions for My Appointment' }} />
      <Stack.Screen name="review" options={{ title: 'Review My Appointment Plan' }} />
      <Stack.Screen name="consent" options={{ title: 'Ask for Recording Consent' }} />
      <Stack.Screen name="support-person" options={{ title: 'Add a Support Person' }} />
      <Stack.Screen name="explore-questions" options={{ title: 'Questions Generated for Me' }} />
      <Stack.Screen name="pain-guide" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
