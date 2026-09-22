import { Stack } from 'expo-router';
import { AuthProvider, useAuth } from '../src/context/AuthContext';

function RootNavigator() {
  const { session, loading } = useAuth();

  // Implements a temporary loading screen for the initial session check
  if (loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* When there is no session, tabs group becomes unreachable */}
      <Stack.Protected guard={!!session}>
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