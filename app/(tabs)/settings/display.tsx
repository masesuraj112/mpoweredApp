import { SettingsSubpage, settingsSubpageStyles } from '@/components/mpowered/SettingsSubpage';
import { Text } from 'react-native';

export default function DisplayScreen() {
  return (
    <SettingsSubpage title="Display">
      <Text style={settingsSubpageStyles.placeholder}>Display preferences coming soon.</Text>
    </SettingsSubpage>
  );
}
