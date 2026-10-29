import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type TabIconName = 'person' | 'folder' | 'planner' | 'settings';

const painTrackerIcon = require('../../assets/images/home-page/stickman.svg');
const carePlannerIcon = require('../../assets/images/home-page/care-planner.svg');
const settingsIcon = require('../../assets/images/home-page/settings.svg');

function TabIcon({ name, focused }: { name: TabIconName; focused: boolean }) {
  const color = '#49454F';

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerSelected]}>
      {name === 'person' || name === 'planner' || name === 'settings' ? (
        <Image
          source={
            name === 'person' ? painTrackerIcon : name === 'planner' ? carePlannerIcon : settingsIcon
          }
          style={
            name === 'person'
              ? styles.painTrackerIcon
              : name === 'planner'
                ? styles.clipboardIcon
                : styles.settingsGearIcon
          }
          contentFit="contain"
          accessibilityLabel=""
        />
      ) : (
        <Svg width={24} height={24} viewBox="0 0 24 24">
          <Path
            d="M3 5.5A1.5 1.5 0 0 1 4.5 4h5l2 2H19.5A1.5 1.5 0 0 1 21 7.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"
            fill={color}
          />
        </Svg>
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#49454F',
        tabBarInactiveTintColor: '#49454F',
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Pain Tracker',
          tabBarIcon: ({ focused }) => <TabIcon name="person" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="health"
        options={{
          title: 'My Health',
          tabBarIcon: ({ focused }) => <TabIcon name="folder" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Care Planner',
          tabBarIcon: ({ focused }) => <TabIcon name="planner" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Setting',
          tabBarIcon: ({ focused }) => <TabIcon name="settings" focused={focused} />,
        }}
      />
      {/* The assessment screens live here but have no tab. `href: null` makes the whole group unreachable on SDK 58, so every push to /tracker/* bounced back to Home. */}
      <Tabs.Screen name="tracker" options={{ tabBarItemStyle: { display: 'none' } }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 5,
    paddingBottom: 6,
    borderTopWidth: 0,
    backgroundColor: '#F2EAF8',
  },
  tabLabel: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 16,
  },
  iconContainer: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  iconContainerSelected: {
    backgroundColor: '#EADDFF',
  },
  painTrackerIcon: {
    width: 18,
    height: 20,
  },
  clipboardIcon: {
    width: 18,
    height: 22,
  },
  settingsGearIcon: {
    width: 56,
    height: 32,
  },
});
