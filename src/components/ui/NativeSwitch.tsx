import { Host, Switch } from '@expo/ui';
import { semantics } from '@expo/ui/jetpack-compose/modifiers';
import { labelsHidden } from '@expo/ui/swift-ui/modifiers';
import { Platform } from 'react-native';

import { useThemeColors } from '@/constants/theme';

type NativeSwitchProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  /** What screen readers announce. Not shown: the row around the switch shows its own label. */
  accessibilityLabel?: string;
  disabled?: boolean;
};

/**
 * The platform's own switch (SwiftUI Toggle on iOS, Material switch on Android), tinted with the brand.
 * It's named for VoiceOver with a hidden label and for TalkBack with a content description.
 */
export function NativeSwitch({ value, onValueChange, accessibilityLabel, disabled }: NativeSwitchProps) {
  const colors = useThemeColors();
  const ios = Platform.OS === 'ios';
  return (
    <Host matchContents seedColor={colors.primary}>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        label={ios ? accessibilityLabel : undefined}
        modifiers={
          ios
            ? [labelsHidden()]
            : accessibilityLabel
              ? [semantics({ contentDescription: accessibilityLabel })]
              : []
        }
      />
    </Host>
  );
}
