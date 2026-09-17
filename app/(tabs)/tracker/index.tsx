import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function TrackerScreen() {
	return (
		<View>
			<Text>Track your pain</Text>
			<Button
				title="Start pain assessment"
				onPress={() => router.push('/tracker/pain/location')}
			/>
		</View>
	);
}
