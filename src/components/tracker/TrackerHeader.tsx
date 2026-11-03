import { router } from 'expo-router';

import { ScreenHeader } from '@/components/ui/ScreenHeader';

/** The navigation header of the tracker question screens: Back to Home, and the tracker's name. */
export function TrackerHeader() {
  return (
    <ScreenHeader
      backLabel="Back to Home"
      title="Pain Tracker"
      onBack={() => router.replace('/(tabs)/home')}
    />
  );
}
