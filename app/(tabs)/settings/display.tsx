import { SettingsOption, SettingsSelect, SettingsSubpage } from '@/components/settings/SettingsSubpage';
import { APPEARANCE_LABELS, useAppearance, type AppearanceChoice } from '@/features/settings/appearance';
import { TEXT_SIZE_LABELS, useTextSize, type TextSizeChoice } from '@/features/settings/textSize';

const textSizeIcon = require('../../../assets/images/settings/textsize.svg');
const darkModeIcon = require('../../../assets/images/settings/darkmode.svg');

const APPEARANCES = Object.keys(APPEARANCE_LABELS) as AppearanceChoice[];
const TEXT_SIZES = Object.keys(TEXT_SIZE_LABELS) as TextSizeChoice[];

export default function DisplayScreen() {
  const appearance = useAppearance();
  const textSize = useTextSize();

  return (
    <SettingsSubpage title="Display">
      {/* On top of the phone's own text size; the headers and tab bar follow only the phone's. */}
      <SettingsOption
        icon={textSizeIcon}
        label="Text size"
        trailing={
          <SettingsSelect
            value={TEXT_SIZE_LABELS[textSize.choice]}
            options={TEXT_SIZES.map((option) => TEXT_SIZE_LABELS[option])}
            onChange={(label) =>
              textSize.setChoice(TEXT_SIZES.find((option) => TEXT_SIZE_LABELS[option] === label) ?? 'default')
            }
            accessibilityLabel="Text size"
          />
        }
      />
      <SettingsOption
        icon={darkModeIcon}
        label="Appearance"
        trailing={
          <SettingsSelect
            value={APPEARANCE_LABELS[appearance.choice]}
            options={APPEARANCES.map((option) => APPEARANCE_LABELS[option])}
            onChange={(label) =>
              appearance.setChoice(APPEARANCES.find((option) => APPEARANCE_LABELS[option] === label) ?? 'system')
            }
            accessibilityLabel="Appearance"
          />
        }
      />
    </SettingsSubpage>
  );
}
