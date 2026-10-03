import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { Text } from 'react-native';

const accountIcon = require('../../../assets/images/settings/account.svg');

export default function SupportPersonsScreen() {
  return (
    <SettingsSubpage title="Support Persons">
      <Text style={styles.sectionTitle}>Manage support persons</Text>
      <SettingsOption icon={accountIcon} label="John Doe" onPress={() => undefined} />
      <SettingsOption icon={accountIcon} label="Jane Doe" onPress={() => undefined} />
    </SettingsSubpage>
  );
}

const styles = { sectionTitle: { fontSize: 20, fontWeight: '600' as const, marginBottom: 12 } };
