import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// My Health's own pages get the platform's header and back button; its home keeps the gradient.
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerBackTitle: 'My Health' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="tracking/summary" options={{ headerBackTitle: 'History' }} />
    </Stack>
  );
}
