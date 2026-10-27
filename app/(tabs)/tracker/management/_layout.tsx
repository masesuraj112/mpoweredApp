import { ManagementAssessmentProvider } from '@/features/assessments/management/context';
import { AssessmentHeader } from '@/components/mpowered/AssessmentHeader';
import { Stack } from 'expo-router';

export default function ManagementLayout() {
	return (
		<ManagementAssessmentProvider>
			<Stack
				screenOptions={{
					headerShown: true,
					header: () => <AssessmentHeader />,
				}}
			/>
		</ManagementAssessmentProvider>
	);
}
