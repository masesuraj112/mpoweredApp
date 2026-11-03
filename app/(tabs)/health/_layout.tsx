import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// My Health's own pages get the platform's header and back button; its home keeps the gradient.
// The known titles are set here, so they show from the first frame.
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerBackTitle: 'My Health' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pain-profile" options={{ title: 'My Pain Profiles' }} />
      <Stack.Screen name="prescriptions/index" options={{ title: 'My Prescriptions' }} />
      <Stack.Screen name="prescriptions/add" options={{ title: 'Add prescription' }} />
      <Stack.Screen name="tracking/chart" options={{ title: 'My Health Tracking Records' }} />
      <Stack.Screen name="tracking/history" options={{ title: 'My Health Tracking Records' }} />
      <Stack.Screen name="tracking/summary" options={{ title: 'Summary', headerBackTitle: 'History' }} />
    </Stack>
  );
}
