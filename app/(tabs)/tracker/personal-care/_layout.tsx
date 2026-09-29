import { PersonalCareAssessmentProvider } from '@/features/assessments/personal-care/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

function PersonalCareHeader({ navigation }: { navigation: { goBack: () => void } }) {
	return (
		<View style={styles.topBar}>
			<Pressable
				onPress={() => navigation.goBack()}
				accessibilityRole="button"
				accessibilityLabel="Back to Home"
				style={styles.backButton}
			>
				<Text style={styles.backArrow}>‹</Text>
				<Text style={styles.backText}>Back to Home</Text>
			</Pressable>
			<Text style={styles.topBarTitle}>Pain Tracker</Text>
		</View>
	);
}

export default function PersonalCareLayout() {
	return (
		<PersonalCareAssessmentProvider>
			<Stack
				screenOptions={{
					headerShown: true,
					header: ({ navigation }) => <PersonalCareHeader navigation={navigation} />,
				}}
			>
				<Stack.Screen name="summary" options={{ headerShown: false }} />
			</Stack>
		</PersonalCareAssessmentProvider>
	);
}

const styles = StyleSheet.create({
	topBar: {
		height: scaleHeight(109),
		backgroundColor: '#E8DEF8',
		paddingTop: scaleHeight(52),
		paddingHorizontal: scaleWidth(24),
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	backButton: {
		flexDirection: 'row',
		alignItems: 'center',
		minHeight: scaleHeight(40),
	},
	backArrow: {
		fontSize: scaleFont(28),
		lineHeight: scaleFont(28),
		color: '#49454F',
		marginRight: scaleWidth(8),
	},
	backText: {
		fontSize: scaleFont(16),
		color: '#49454F',
	},
	topBarTitle: {
		fontSize: scaleFont(16),
		fontWeight: '600',
		color: '#000000',
	},
});
