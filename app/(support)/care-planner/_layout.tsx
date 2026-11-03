import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// The support person's Care Planner pages get the platform's header and back button; its home keeps the gradient.
// The known titles are set here, so they show from the first frame.
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="requests" options={{ title: 'Support person requests' }} />
      <Stack.Screen name="appointment/[appointmentId]/index" options={{ title: 'Appointment Plan' }} />
      <Stack.Screen name="appointment/[appointmentId]/questions" options={{ title: 'Add Questions' }} />
    </Stack>
  );
}
