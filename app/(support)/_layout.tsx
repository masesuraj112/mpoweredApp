import { NativeTabs } from 'expo-router/native-tabs';

import { useThemeColors } from '@/constants/theme';
import { SupportPersonProvider } from '@/features/support-person/context';

// The support person app's tabs, with the platform's own tab bar (see app/(tabs)/_layout.tsx).
export default function SupportLayout() {
  const colors = useThemeColors();
  return (
    <SupportPersonProvider>
      <NativeTabs tintColor={colors.primary} indicatorColor={colors.primaryContainer}>
        <NativeTabs.Trigger name="care-planner">
          <NativeTabs.Trigger.Icon sf={{ default: 'list.clipboard', selected: 'list.clipboard.fill' }} md="assignment" />
          <NativeTabs.Trigger.Label>Care Planner</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="support-settings">
          <NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} md="settings" />
          <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </SupportPersonProvider>
  );
}
