import { Stack } from 'expo-router';

import { HeaderTitleFonts, useThemeColors } from '@/constants/theme';

// The platform's own header: each page sets its title (SettingsSubpage), and Back is labelled Settings.
export default function SettingsLayout() {
  const colors = useThemeColors();
  return (
    <Stack screenOptions={{ ...HeaderTitleFonts, headerTintColor: colors.primary, headerBackTitle: 'Settings' }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
