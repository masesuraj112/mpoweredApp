import { Stack, useFocusEffect, useNavigation } from 'expo-router';
import { useCallback } from 'react';

import { HeaderTitleFonts, useThemeColors } from '@/constants/theme';

/**
 * The platform's own header and back button (as on the Settings pages), for every stack in the app: the
 * brand tint and Sulphur Point titles. Spread into a Stack's `screenOptions`
 * and give `headerBackTitle` the screen it returns to (iOS shows it; Android shows the arrow).
 */
export function useNativeHeaderOptions() {
  const colors = useThemeColors();
  // No custom header background or shadow: the navigation theme supplies them, as on the Settings pages.
  // The title gets the text colour explicitly so it shows in light and dark mode.
  return {
    headerShown: true,
    title: '',
    headerTitleStyle: { ...HeaderTitleFonts.headerTitleStyle, color: colors.text },
    headerTintColor: colors.primary,
  } as const;
}

/**
 * Puts the page's title in the native header bar. Every screen uses the standard bar title (as the
 * assessments do), never the large iOS title, so the header looks the same everywhere and doesn't change
 * as the page scrolls.
 */
export function ScreenTitle({ title }: { title: string }) {
  return <Stack.Screen options={{ title }} />;
}

/**
 * The title for the assessment screens. Their header belongs to the Pain Tracker stack's `tracker` route
 * (so its back button returns Home from any question), a navigator or two above the screen, so the title
 * is set there, each time a screen comes into view.
 */
// Just what the walk up the navigators needs.
type NavigatorLevel = {
  getState: () => { routeNames?: string[] } | undefined;
  setOptions: (options: object) => void;
  getParent: () => NavigatorLevel | undefined;
};

export function useTrackerTitle(title: string) {
  const navigation = useNavigation() as unknown as NavigatorLevel;
  useFocusEffect(
    useCallback(() => {
      let nav: NavigatorLevel | undefined = navigation;
      while (nav) {
        if (nav.getState()?.routeNames?.includes('tracker')) {
          nav.setOptions({ title });
          return;
        }
        nav = nav.getParent();
      }
    }, [navigation, title]),
  );
}
