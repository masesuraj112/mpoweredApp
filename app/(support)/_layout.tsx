import { TabIcon, TAB_ICON_PILL_HEIGHT, TAB_ICON_PILL_WIDTH } from '@/components/navigation/TabIcon';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { SupportPersonProvider } from '@/features/support-person/context';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const carePlannerIcon = require('../../assets/images/support-person/tab-care-planner.svg');
const settingsIcon = require('../../assets/images/support-person/tab-settings.svg');

/** Material 3 nav item: the selected tab's icon sits on a pill (Figma 3911-24710). */
function SupportTabIcon({ source, focused, width, height }: { source: number; focused: boolean; width: number; height: number }) {
  return (
    <TabIcon focused={focused}>
      <Image source={source} style={{ width, height }} contentFit="contain" accessibilityLabel="" />
    </TabIcon>
  );
}

export default function SupportLayout() {
  const insets = useSafeAreaInsets();

  return (
    <SupportPersonProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          // The default bar is only 49pt tall, which pushes the labels below the pill out of view.
          tabBarStyle: [styles.tabBar, { height: TAB_BAR_HEIGHT + insets.bottom }],
          tabBarIconStyle: styles.iconSlot,
          tabBarLabelStyle: styles.tabLabel,
          tabBarActiveTintColor: Colors.light.onSurface,
          tabBarInactiveTintColor: Colors.light.onSurfaceVariant,
        }}
      >
        <Tabs.Screen
          name="care-planner"
          options={{
            title: 'Care Planner',
            tabBarIcon: ({ focused }) => <SupportTabIcon source={carePlannerIcon} focused={focused} width={18} height={22} />,
          }}
        />
        <Tabs.Screen
          name="support-settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <SupportTabIcon source={settingsIcon} focused={focused} width={20.1} height={20} />,
          }}
        />
      </Tabs>
    </SupportPersonProvider>
  );
}

// Height of the Figma nav bar, not counting the phone's home indicator area.
const TAB_BAR_HEIGHT = 64;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.light.surfaceContainer,
    borderTopWidth: 0,
    paddingTop: Spacing.one + Spacing.half,
  },
  // Make the icon area the size of the pill, so the pill doesn't overflow onto the label.
  iconSlot: {
    width: TAB_ICON_PILL_WIDTH,
    height: TAB_ICON_PILL_HEIGHT,
  },
  tabLabel: {
    ...Typography.labelMedium,
    marginTop: Spacing.one,
  },
});
