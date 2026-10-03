import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { router } from 'expo-router';

const privacyIcon = require('../../../assets/images/settings/privacy-data-legal.svg');
const exportIcon = require('../../../assets/images/settings/exportdata.svg');
const deleteIcon = require('../../../assets/images/settings/delete.svg');


export default function LegalScreen() {
  return (
    <SettingsSubpage title="Privacy/Data and Legal">
      <SettingsOption icon={privacyIcon} label="View PP and T&Cs" onPress={() => router.push('/settings/privacy')} />
      <SettingsOption icon={exportIcon} label="Export my data" onPress={() => undefined} />
      <SettingsOption icon={deleteIcon} label="Account deletion" onPress={() => undefined} destructive />
    </SettingsSubpage>
  );
}
