import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { TabIcon } from '@/components/navigation/TabIcon';
import { Colors, Typography } from '@/constants/theme';
import { RemindersProvider } from '@/features/notifications/RemindersContext';
import { useOpenTappedReminder } from '@/features/notifications/useOpenTappedReminder';

type TabIconName = 'person' | 'folder' | 'planner' | 'settings';

const painTrackerIcon = require('../../assets/images/home-page/stickman.svg');
const carePlannerIcon = require('../../assets/images/home-page/care-planner.svg');
const settingsIcon = require('../../assets/images/home-page/settings.svg');

function TabBarIcon({ name, focused }: { name: TabIconName; focused: boolean }) {
  const color = Colors.light.onSurfaceVariant;

  return (
    <TabIcon focused={focused}>
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
    </TabIcon>
  );
}

export default function TabsLayout() {
  // Only patients reach the tabs, so only they get reminders (support persons have none).
  useOpenTappedReminder();
  return (
    <RemindersProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Colors.light.onSurfaceVariant,
          tabBarInactiveTintColor: Colors.light.onSurfaceVariant,
          tabBarLabelStyle: styles.tabLabel,
          tabBarStyle: styles.tabBar,
          // Android shrinks the window when the keyboard opens, which would lift the bar on top of it.
          // Hiding it keeps it out of the way, as on iPhone where the keyboard covers it.
          tabBarHideOnKeyboard: true,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Pain Tracker',
            tabBarIcon: ({ focused }) => <TabBarIcon name="person" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="health"
          options={{
            title: 'My Health',
            tabBarIcon: ({ focused }) => <TabBarIcon name="folder" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="planner"
          options={{
            title: 'Care Planner',
            tabBarIcon: ({ focused }) => <TabBarIcon name="planner" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <TabBarIcon name="settings" focused={focused} />,
          }}
        />
        {/* The assessment screens live here but have no tab. `href: null` makes the whole group unreachable on SDK 58, so every push to /tracker/* bounced back to Home. */}
        <Tabs.Screen name="tracker" options={{ tabBarItemStyle: { display: 'none' } }} />
      </Tabs>
    </RemindersProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 76,
    paddingTop: 5,
    paddingBottom: 6,
    borderTopWidth: 0,
    backgroundColor: Colors.light.surfaceContainer,
  },
  tabLabel: {
    ...Typography.labelMedium,
    marginTop: 3,
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
