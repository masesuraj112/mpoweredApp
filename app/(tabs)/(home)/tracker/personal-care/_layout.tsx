import { PersonalCareAssessmentProvider } from '@/features/assessments/personal-care/context';
import { AssessmentHeader } from '@/components/mpowered/AssessmentHeader';
import { Stack } from 'expo-router';

export default function PersonalCareLayout() {
	return (
		// Keep assessment answers alive while navigating between these routes.
		<PersonalCareAssessmentProvider>
			<Stack
				screenOptions={{
					headerShown: true,
					header: () => <AssessmentHeader />,
				}}
			/>
		</PersonalCareAssessmentProvider>
	);
}
