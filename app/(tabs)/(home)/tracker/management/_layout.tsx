import { ManagementAssessmentProvider } from '@/features/assessments/management/context';
import { Stack } from 'expo-router';

export default function ManagementLayout() {
	return (
		<ManagementAssessmentProvider>
			<Stack
				screenOptions={{ headerShown: false }}
			/>
		</ManagementAssessmentProvider>
	);
}
