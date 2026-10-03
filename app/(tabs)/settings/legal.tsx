import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { router } from 'expo-router';

const privacyIcon = require('../../../assets/images/settings/privacy-data-legal.svg');

export default function LegalScreen() {
  return (
    <SettingsSubpage title="Privacy/Data and Legal">
      <SettingsOption icon={privacyIcon} label="View PP and T&Cs" onPress={() => router.push('/settings/privacy')} />
      <SettingsOption label="Export my data" onPress={() => undefined} />
      <SettingsOption label="Account deletion" onPress={() => undefined} destructive />
    </SettingsSubpage>
  );
}
