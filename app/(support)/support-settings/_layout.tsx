import { Stack } from 'expo-router';

// TODO (step 7): share the Back / "Settings" header with app/(tabs)/settings/_layout.tsx.
export default function SupportSettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
