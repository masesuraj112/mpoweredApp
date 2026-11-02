import { Stack } from 'expo-router';

// The Pain Tracker tab: Home, with the assessment screens pushed on top of it, so they live in this tab
// (a native tab bar can't open a hidden tab).
export const unstable_settings = { initialRouteName: 'home' };

export default function PainTrackerLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
