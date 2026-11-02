import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';

// The platform's own header: each page sets its title (SettingsSubpage), and Back is labelled Settings.
export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerTintColor: Colors.light.primary, headerBackTitle: 'Settings' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
