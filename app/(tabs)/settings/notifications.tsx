import { SettingsSubpage, settingsSubpageStyles } from '@/components/mpowered/SettingsSubpage';
import { Text } from 'react-native';

export default function NotificationsScreen() {
  return (
    <SettingsSubpage title="Notifications">
      <Text style={settingsSubpageStyles.placeholder}>Notification preferences coming soon.</Text>
    </SettingsSubpage>
  );
}
