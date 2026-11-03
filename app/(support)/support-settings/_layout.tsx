import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Stack } from 'expo-router';

export default function SupportSettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        header: ({ navigation }) => <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
