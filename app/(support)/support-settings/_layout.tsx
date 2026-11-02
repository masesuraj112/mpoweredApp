import { Stack } from 'expo-router';

import { useThemeColors } from '@/constants/theme';

// The platform's own header: each page sets its title (SettingsSubpage), and Back is labelled Settings.
export default function SupportSettingsLayout() {
  const colors = useThemeColors();
  return (
    <Stack screenOptions={{ headerTintColor: colors.primary, headerBackTitle: 'Settings' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
