import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// The Care Planner's steps get the platform's header and back button; its home keeps the gradient.
export default function Layout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerBackTitle: 'Back' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
