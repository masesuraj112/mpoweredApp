import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// My Health's own pages get the platform's header and back button; its home keeps the gradient.
// Large titles and the known titles are set here, before the first frame: iOS only lays out a large title
// that is on from the start (turned on later, it stays hidden until the page is scrolled).
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerLargeTitle: true, headerBackTitle: 'My Health' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="pain-profile" options={{ title: 'My Pain Profiles' }} />
      <Stack.Screen name="prescriptions/index" options={{ title: 'My Prescriptions' }} />
      <Stack.Screen name="prescriptions/add" options={{ title: 'Add prescription' }} />
      <Stack.Screen name="tracking/chart" options={{ title: 'My Health Tracking Records' }} />
      <Stack.Screen name="tracking/history" options={{ title: 'My Health Tracking Records' }} />
      <Stack.Screen name="tracking/summary" options={{ title: 'Summary', headerBackTitle: 'History' }} />
      <Stack.Screen name="pain-guide" options={{ headerLargeTitle: false }} />
    </Stack>
  );
}
