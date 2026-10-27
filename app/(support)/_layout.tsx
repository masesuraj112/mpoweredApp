import { Colors } from '@/constants/theme';
import { SupportPersonProvider } from '@/features/support-person/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const carePlannerIcon = require('../../assets/images/support-person/tab-care-planner.svg');
const settingsIcon = require('../../assets/images/support-person/tab-settings.svg');

/** Material 3 nav item: the selected tab's icon sits on a pill (Figma 3911-24710). */
function TabIcon({ source, focused, width, height }: { source: number; focused: boolean; width: number; height: number }) {
  return (
    <View style={[styles.iconPill, focused && styles.iconPillActive]}>
      <Image source={source} style={{ width, height }} contentFit="contain" accessibilityLabel="" />
    </View>
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
            tabBarIcon: ({ focused }) => <TabIcon source={carePlannerIcon} focused={focused} width={18} height={22} />,
          }}
        />
        <Tabs.Screen
          name="support-settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ focused }) => <TabIcon source={settingsIcon} focused={focused} width={20.1} height={20} />,
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
    paddingTop: 6,
  },
  // Make the icon area the size of the pill, so the pill doesn't overflow onto the label.
  iconSlot: {
    width: scaleWidth(56),
    height: 32,
  },
  tabLabel: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop: scaleHeight(4),
  },
  iconPill: {
    width: scaleWidth(56),
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: Colors.light.secondaryContainer,
  },
});
