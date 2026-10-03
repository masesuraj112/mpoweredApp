import { SettingsOption, SettingsSelect, SettingsSubpage, SettingsToggle } from '@/components/mpowered/SettingsSubpage';
import { useState } from 'react';

export default function DisplayScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <SettingsSubpage title="Display">
      <SettingsOption label="Text size" trailing={<SettingsSelect value="Medium" />} />
      <SettingsOption label="Enable dark mode" trailing={<SettingsToggle value={darkMode} onValueChange={setDarkMode} />} />
    </SettingsSubpage>
  );
}
