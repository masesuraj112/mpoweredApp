import { BackHeader } from '@/components/mpowered/BackHeader';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				header: ({ navigation }) => <BackHeader title="Settings" onBack={() => navigation.goBack()} />,
			}}
		>
			<Stack.Screen name="index" options={{ headerShown: false }} />
		</Stack>
	);
}
