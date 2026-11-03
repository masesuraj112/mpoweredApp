import { SocialHealthAssessmentProvider } from '@/features/assessments/social-health/context';
import { TrackerHeader } from '@/components/tracker/TrackerHeader';
import { Stack } from 'expo-router';

export default function SocialHealthLayout() {
	return (
		// Keep assessment answers alive while navigating between these routes.
		<SocialHealthAssessmentProvider>
			<Stack screenOptions={{ headerShown: true, header: () => <TrackerHeader /> }}>
				<Stack.Screen name="summary" options={{ headerShown: false }} />
			</Stack>
		</SocialHealthAssessmentProvider>
	);
}
