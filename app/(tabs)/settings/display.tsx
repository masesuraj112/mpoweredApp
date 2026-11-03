import { SettingsOption, SettingsSelect, SettingsSubpage } from '@/components/settings/SettingsSubpage';
import { APPEARANCE_LABELS, useAppearance, type AppearanceChoice } from '@/features/settings/appearance';

// Text size stays out until something reads it; the app already follows the phone's text size.
const darkModeIcon = require('../../../assets/images/settings/darkmode.svg');

const CHOICES = Object.keys(APPEARANCE_LABELS) as AppearanceChoice[];

export default function DisplayScreen() {
  const { choice, setChoice } = useAppearance();

  return (
    <SettingsSubpage title="Display">
      <SettingsOption
        icon={darkModeIcon}
        label="Appearance"
        trailing={
          <SettingsSelect
            value={APPEARANCE_LABELS[choice]}
            options={CHOICES.map((option) => APPEARANCE_LABELS[option])}
            onChange={(label) => setChoice(CHOICES.find((option) => APPEARANCE_LABELS[option] === label) ?? 'system')}
            accessibilityLabel="Appearance"
          />
        }
      />
    </SettingsSubpage>
  );
}
