import { ManagementAssessmentProvider } from '@/features/assessments/management/context';
import { TrackerHeader } from '@/components/tracker/TrackerHeader';
import { Stack } from 'expo-router';

export default function ManagementLayout() {
	return (
		<ManagementAssessmentProvider>
			<Stack
				screenOptions={{
					headerShown: true,
					header: () => <TrackerHeader />,
				}}
			/>
		</ManagementAssessmentProvider>
	);
}
