import { SocialHealthAssessmentProvider } from '@/features/assessments/social-health/context';
import { Stack } from 'expo-router';

export default function SocialHealthLayout() {
	return (
		// Keep assessment answers alive while navigating between these routes.
		<SocialHealthAssessmentProvider>
			<Stack screenOptions={{ headerShown: false }} />
		</SocialHealthAssessmentProvider>
	);
}
