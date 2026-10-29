import { SettingsOption, SettingsSubpage } from '@/components/mpowered/SettingsSubpage';
import { useExportMyData } from '@/features/settings/useExportMyData';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';

const privacyIcon = require('../../../assets/images/settings/privacy-data-legal.svg');
const exportIcon = require('../../../assets/images/settings/exportdata.svg');
const deleteIcon = require('../../../assets/images/settings/delete.svg');


export default function LegalScreen() {
  const { exporting, exportData } = useExportMyData();

  const handleExport = async () => {
    if (exporting) return;
    const errorMessage = await exportData();
    if (!errorMessage) return;
    // Alert.alert is a no-op on react-native-web, so fall back to the browser dialog there
    if (Platform.OS === 'web') window.alert(errorMessage);
    else Alert.alert('Export failed', errorMessage);
  };

  return (
    <SettingsSubpage title="Privacy/Data and Legal">
      {/* Relative, so the support person app (which reuses this screen) opens its own privacy page. */}
      <SettingsOption icon={privacyIcon} label="View PP and T&Cs" onPress={() => router.push('./privacy')} />
      <SettingsOption
        icon={exportIcon}
        label={exporting ? 'Preparing your data…' : 'Export my data'}
        onPress={handleExport}
      />
      <SettingsOption icon={deleteIcon} label="Account deletion" onPress={() => undefined} destructive />
    </SettingsSubpage>
  );
}
