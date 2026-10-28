import { SocialHealthAssessmentProvider } from '@/features/assessments/social-health/context';
import { AssessmentHeader } from '@/components/mpowered/AssessmentHeader';
import { Stack } from 'expo-router';

export default function SocialHealthLayout() {
	return (
		// Keep assessment answers alive while navigating between these routes.
		<SocialHealthAssessmentProvider>
			<Stack screenOptions={{ headerShown: true, header: () => <AssessmentHeader /> }}>
				<Stack.Screen name="summary" options={{ headerShown: false }} />
			</Stack>
		</SocialHealthAssessmentProvider>
	);
}
