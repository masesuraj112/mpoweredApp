import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

// Dev-only: set EXPO_PUBLIC_BYPASS_AUTH=true in .env to reach every route regardless of session
const bypassAuth = __DEV__ && process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true';

function RootNavigator() {
  const { session, loading } = useAuth();

  // Implements a temporary loading screen for the initial session check
  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session || bypassAuth}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* When there is no session, tabs group becomes unreachable */}
      <Stack.Protected guard={!!session || bypassAuth}>
        <Stack.Screen name="(tabs)" />
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