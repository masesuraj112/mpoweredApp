import { SettingsSubpage, settingsSubpageStyles } from '@/components/mpowered/SettingsSubpage';
import { Text } from 'react-native';

export default function PrivacyScreen() {
  return (
    <SettingsSubpage title="Privacy Policy">
      <Text style={settingsSubpageStyles.placeholder}>Privacy policy coming soon.</Text>
    </SettingsSubpage>
  );
}
