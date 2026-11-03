import { Stack } from 'expo-router';

import { useNativeHeaderOptions } from '@/components/ui/nativeHeader';

// The platform's own header: each page sets its title (SettingsSubpage), and Back is labelled Settings.
export default function SupportSettingsLayout() {
  const header = useNativeHeaderOptions();
  return (
    <Stack screenOptions={{ ...header, headerBackTitle: 'Settings' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
