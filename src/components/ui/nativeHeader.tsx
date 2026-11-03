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
  // No custom header background or shadow (the navigation theme supplies them, as the Settings pages
  // always had): on iOS a set background leaves the large title invisible until the page is scrolled.
  // Both titles get the text colour explicitly so they show in light and dark mode.
  return {
    headerShown: true,
    title: '',
    headerTitleStyle: { ...HeaderTitleFonts.headerTitleStyle, color: colors.text },
    headerLargeTitleStyle: { ...HeaderTitleFonts.headerLargeTitleStyle, color: colors.text },
    headerTintColor: colors.primary,
  } as const;
}

/**
 * Puts the page's title in the native header: large while the page is at the top, shrinking into the bar
 * as it scrolls (iOS); the bar's title on Android. The page's scroll view needs
 * `contentInsetAdjustmentBehavior="automatic"` for the large title to follow it.
 */
export function ScreenTitle({ title }: { title: string }) {
  return <Stack.Screen options={{ title, headerLargeTitle: true }} />;
}

/**
 * The title for the assessment screens. Their header belongs to the Pain Tracker stack's `tracker` route
 * (so its back button returns Home from any question), a navigator or two above the screen, so the title
 * is set there, each time a screen comes into view. It is the standard title, not a large one: iOS can
 * only shrink a large title with a scroll view in the header's own screen, and these are nested deeper.
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
          nav.setOptions({ title, headerLargeTitle: false });
          return;
        }
        nav = nav.getParent();
      }
    }, [navigation, title]),
  );
}
