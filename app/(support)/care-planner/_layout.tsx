import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// The support person's Care Planner pages get the platform's header and back button; its home keeps the gradient.
// Large titles and the known titles are set here, before the first frame: iOS only lays out a large title
// that is on from the start (turned on later, it stays hidden until the page is scrolled).
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerLargeTitle: true, headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="requests" options={{ title: 'Support person requests' }} />
      <Stack.Screen name="appointment/[appointmentId]/index" options={{ title: 'Appointment Plan' }} />
      <Stack.Screen name="appointment/[appointmentId]/questions" options={{ title: 'Add Questions' }} />
      <Stack.Screen name="[patientId]" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
