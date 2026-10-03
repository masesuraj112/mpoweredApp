import { SettingsSubpage, settingsSubpageStyles } from '@/components/mpowered/SettingsSubpage';
import { Text } from 'react-native';

export default function SupportPersonsScreen() {
  return (
    <SettingsSubpage title="Support Persons">
      <Text style={settingsSubpageStyles.placeholder}>Support persons coming soon.</Text>
    </SettingsSubpage>
  );
}
