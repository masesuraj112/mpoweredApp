import { NativeTabs } from 'expo-router/native-tabs';

import { Colors } from '@/constants/theme';
import { RemindersProvider } from '@/features/notifications/RemindersContext';
import { useOpenTappedReminder } from '@/features/notifications/useOpenTappedReminder';

// The platform's own tab bar: Liquid Glass on iOS 26, the Material navigation bar on Android. Icons are
// SF Symbols and Material Symbols, filled when selected.
export default function TabsLayout() {
  // Only patients reach the tabs, so only they get reminders (support persons have none).
  useOpenTappedReminder();
  return (
    <RemindersProvider>
      <NativeTabs tintColor={Colors.light.primary} indicatorColor={Colors.light.primaryContainer}>
        <NativeTabs.Trigger name="(home)">
          <NativeTabs.Trigger.Icon sf="figure.stand" md="accessibility_new" />
          <NativeTabs.Trigger.Label>Pain Tracker</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="health">
          <NativeTabs.Trigger.Icon sf={{ default: 'folder', selected: 'folder.fill' }} md="folder" />
          <NativeTabs.Trigger.Label>My Health</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="planner">
          <NativeTabs.Trigger.Icon sf={{ default: 'list.clipboard', selected: 'list.clipboard.fill' }} md="assignment" />
          <NativeTabs.Trigger.Label>Care Planner</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="settings">
          <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </RemindersProvider>
  );
}
