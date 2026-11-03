import { HeaderTitleFonts, useThemeColors } from '@/constants/theme';

/**
 * The platform's own header and back button (as on the Settings pages), for every stack in the app: the
 * brand tint, Sulphur Point titles and the page's own background. Spread into a Stack's `screenOptions`
 * and give `headerBackTitle` the screen it returns to (iOS shows it; Android shows the arrow).
 */
export function useNativeHeaderOptions() {
  const colors = useThemeColors();
  return {
    headerShown: true,
    title: '',
    ...HeaderTitleFonts,
    headerTintColor: colors.primary,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: colors.background },
  } as const;
}
