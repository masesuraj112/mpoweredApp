// Text size and dark mode only changed local state (nothing reads them), so they're commented out
// until they work, and the Settings home hides the Display row (see docs/settings-backend.md).
// import { SettingsOption, SettingsSelect, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
// import { useState } from 'react';
import { SettingsSubpage, settingsSubpageStyles } from '@/components/mpowered/SettingsSubpage';
import { Text } from 'react-native';

// const textSizeIcon = require('../../../assets/images/settings/textsize.svg');
// const darkModeIcon = require('../../../assets/images/settings/darkmode.svg');

export default function DisplayScreen() {
  // const [darkMode, setDarkMode] = useState(false);
  // const [textSize, setTextSize] = useState('Medium');

  return (
    <SettingsSubpage title="Display">
      <Text style={settingsSubpageStyles.placeholder}>Display settings are coming soon.</Text>
      {/* <SettingsOption
        icon={textSizeIcon}
        label="Text size"
        elevated
        trailing={<SettingsSelect value={textSize} options={['Small', 'Medium', 'Large']} onChange={setTextSize} />}
      />
      <SettingsOption icon={darkModeIcon} label="Enable dark mode" trailing={<SettingsToggle value={darkMode} onValueChange={setDarkMode} />} /> */}
    </SettingsSubpage>
  );
}
