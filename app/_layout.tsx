import { Stack } from 'expo-router';
import { Button, Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { accountType } from '../src/features/support-person/account-type';

// Dev-only: set EXPO_PUBLIC_BYPASS_AUTH=true in .env to reach every route regardless of session
const bypassAuth = __DEV__ && process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true';

function RootNavigator() {
  const { session, loading, hasProfile, profileError, refreshProfile } = useAuth();

  // Implements a temporary loading screen for the initial session check
  if (loading) return null;

  // Signed in, but we could not tell whether there is a profile (for example no connection)
  if (session && profileError) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ textAlign: 'center', marginBottom: 16 }}>
          We could not load your account. Check your connection and try again.
        </Text>
        <Button title="Try again" onPress={refreshProfile} />
      </View>
    );
  }

  // The app itself needs both a session and a profile; everything else stays in (auth). While
  // the profile check runs (hasProfile null) the user stays in (auth): rendering nothing here
  // would unmount the verify screen in the middle of signing in.
  const canUseApp = !!session && hasProfile === true;
  const isSupportPerson = accountType === 'support-person';

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!canUseApp || bypassAuth}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Without a session and a profile, the tabs group becomes unreachable */}
      <Stack.Protected guard={(canUseApp && !isSupportPerson) || bypassAuth}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      {/* Support persons get their own app (Care Planner and Settings) instead of the patient tabs */}
      <Stack.Protected guard={(canUseApp && isSupportPerson) || bypassAuth}>
        <Stack.Screen name="(support)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
