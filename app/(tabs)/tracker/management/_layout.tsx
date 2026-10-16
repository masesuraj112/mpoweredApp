import { ManagementAssessmentProvider } from '@/features/assessments/management/context';
import { AssessmentHeader } from '@/components/mpowered/AssessmentHeader';
import { Stack } from 'expo-router';

export default function ManagementLayout() {
	return (
		// TODO: Replace flow-local answer state with persisted Management submissions when backend support is added.
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
