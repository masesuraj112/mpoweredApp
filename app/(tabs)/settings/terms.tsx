import { SettingsSubpage, settingsSubpageStyles } from '@/components/settings/SettingsSubpage';
import { Text } from 'react-native';

export default function TermsScreen() {
  return (
    <SettingsSubpage title="Terms and Conditions">
      <Text style={settingsSubpageStyles.placeholder}>Terms and conditions coming soon.</Text>
    </SettingsSubpage>
  );
}
