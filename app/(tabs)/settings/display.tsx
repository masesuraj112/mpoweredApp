import { SettingsOption, SettingsSelect, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { useState } from 'react';

const textSizeIcon = require('../../../assets/images/settings/textsize.svg');
const darkModeIcon = require('../../../assets/images/settings/darkmode.svg');

export default function DisplayScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SettingsSubpage title="Display">
      <SettingsOption icon={textSizeIcon} label="Text size" trailing={<SettingsSelect value="Medium" />} />
      <SettingsOption icon={darkModeIcon} label="Enable dark mode" trailing={<SettingsToggle value={darkMode} onValueChange={setDarkMode} />} />
    </SettingsSubpage>
  );
}
