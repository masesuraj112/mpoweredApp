import { router } from 'expo-router';

import { BackBar } from '@/components/ui/BackBar';

/** The tracker sections' header: back to the Pain Tracker home. */
export function AssessmentHeader() {
  return <BackBar label="Back to Home" title="Pain Tracker" onPress={() => router.dismissTo('/home')} />;
}
