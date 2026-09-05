import { Tabs } from 'expo-router';

export default function TabsLayout() {
	return (
		<Tabs screenOptions={{ headerShown: false }}>
			<Tabs.Screen name="home" options={{ title: 'Home' }} />
			<Tabs.Screen name="health" options={{ title: 'Health' }} />
			<Tabs.Screen name="planner" options={{ title: 'Planner' }} />
			<Tabs.Screen name="tracker" options={{ title: 'Tracker' }} />
			<Tabs.Screen name="settings" options={{ title: 'Settings' }} />
		</Tabs>
	);
}
