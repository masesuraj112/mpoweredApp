import { SulphurPoint_700Bold, useFonts } from '@expo-google-fonts/sulphur-point';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { AppLockGate } from '../src/components/auth/AppLockGate';
import { WelcomeSplash } from '../src/components/splash/WelcomeSplash';
import { ErrorState } from '../src/components/ui/ErrorState';
import { Colors, Spacing, useThemeColors, type ThemeColors } from '../src/constants/theme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { showWelcomeBack, WELCOME_SPLASH_MS } from '../src/features/splash/startup';
import { useMinimumDuration } from '../src/features/splash/useMinimumDuration';
import { AppLockProvider } from '../src/features/app-lock/AppLockContext';
import { restoreAppearance } from '../src/features/settings/appearance';

// Keep the native splash (the M on purple) up until the session has been read, so the app never shows a
// blank screen while it starts. It then fades into the first screen (docs/backend/app-icons-and-splash-plan.md).
void SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 300, fade: true });
// A light or dark choice from Settings > Display, applied before the first screen shows.
void restoreAppearance();

// Dev-only: set EXPO_PUBLIC_BYPASS_AUTH=true in .env to reach every route regardless of session
const bypassAuth = __DEV__ && process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true';

function RootNavigator() {
  const [fontsLoaded, fontError] = useFonts({ SulphurPoint_700Bold });
  // A font that fails to load falls back to the system font rather than keeping the app closed.
  const fontsReady = fontsLoaded || !!fontError;
  const { session, loading: sessionLoading, hasProfile, profile, profileError, refreshProfile, signInHeld } = useAuth();

  const loading = sessionLoading || !fontsReady;
  const colors = useThemeColors();

  useEffect(() => {
    if (!loading) SplashScreen.hide();
  }, [loading]);

  // Whether the app opened signed in, fixed once the session has been read. Signing out ends it for good, so
  // signing in again later in the same run never shows "Welcome back to" over the sign-in screens.
  const [startedSignedIn, setStartedSignedIn] = useState<boolean | null>(null);
  if (!loading && startedSignedIn === null) setStartedSignedIn(!!session);
  if (!loading && startedSignedIn && !session) setStartedSignedIn(false);
  const minimumElapsed = useMinimumDuration(WELCOME_SPLASH_MS, !loading);
  const welcomeBack = showWelcomeBack({ startedSignedIn, hasProfile, profileError, minimumElapsed });

  // The native splash is still showing while the session and the heading font load
  if (loading) return null;

  // Signed in, but we could not tell whether there is a profile (for example no connection)
  if (session && profileError) {
    return (
      <View style={[styles.errorScreen, { backgroundColor: colors.background }]}>
        <ErrorState
          message="We could not load your account. Check your connection and try again."
          onRetry={refreshProfile}
        />
      </View>
    );
  }

  // The app itself needs both a session and a profile; everything else stays in (auth). While
  // the profile check runs (hasProfile null) the user stays in (auth): rendering nothing here
  // would unmount the verify screen in the middle of signing in. A held sign-in also stays: the person
  // is choosing what to do about an account that already exists.
  const canUseApp = !!session && hasProfile === true && !signInHeld;
  // A failed guard redirects, it no longer hides the group. The default target is the first group
  // that is allowed, which is the bare path "/(tabs)": it has no index route, so it is "unmatched".
  // Each guard therefore names where to go.

  // Saved at sign-up (users.user_type). Support persons have no patients row, so never open the tabs.
  const isSupportPerson = profile?.userType === 'support_person';
  // Where a signed-in user belongs: the patient tabs, or the support person app.
  const homePath = isSupportPerson ? '/care-planner' : '/home';

  // "Welcome back to" covers the app rather than replacing it, so the first screen loads underneath.
  // The optional app lock (Account settings) goes over both, once the splash has finished.
  return (
    <AppLockProvider active={canUseApp}>
      <AppLockGate waiting={welcomeBack}>
        <View style={styles.root}>
          <View
            style={styles.root}
            accessibilityElementsHidden={welcomeBack}
            importantForAccessibility={welcomeBack ? 'no-hide-descendants' : 'auto'}
          >
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!canUseApp || bypassAuth} redirectTo={homePath}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>

              {/* Without a session and a profile, the tabs group becomes unreachable */}
              <Stack.Protected
                guard={(canUseApp && !isSupportPerson) || bypassAuth}
                redirectTo={canUseApp ? homePath : '/'}
              >
                <Stack.Screen name="(tabs)" />
              </Stack.Protected>

              {/* Support persons get their own app (Care Planner and Settings) instead of the patient tabs */}
              <Stack.Protected
                guard={(canUseApp && isSupportPerson) || bypassAuth}
                redirectTo={canUseApp ? homePath : '/'}
              >
                <Stack.Screen name="(support)" />
              </Stack.Protected>
            </Stack>
          </View>
          {welcomeBack && (
            <View style={StyleSheet.absoluteFill}>
              <WelcomeSplash greeting="Welcome back to" />
            </View>
          )}
        </View>
      </AppLockGate>
    </AppLockProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  errorScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
});

// Screens, headers and the status bar follow the phone's light or dark appearance.
function navigationTheme(base: Theme, colors: ThemeColors): Theme {
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.divider,
      notification: colors.error,
    },
  };
}

const navigationThemes = {
  light: navigationTheme(DefaultTheme, Colors.light),
  dark: navigationTheme(DarkTheme, Colors.dark),
};

export default function RootLayout() {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <ThemeProvider value={navigationThemes[scheme]}>
      <StatusBar style="auto" />
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
