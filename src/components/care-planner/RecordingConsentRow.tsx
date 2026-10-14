import { StyleSheet, Text } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Radius, Spacing } from '@/constants/theme';

type RecordingConsentRowProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const CONSENT_LABEL = 'Ask consent for recording answers (Required)';

/** The tick box for consent to record answers. It must be ticked before questions can be modified. */
export function RecordingConsentRow({ checked, onChange }: RecordingConsentRowProps) {
  return (
    <Checkbox
      checked={checked}
      onChange={onChange}
      accessibilityLabel={CONSENT_LABEL}
      label={<Text style={styles.label}>{CONSENT_LABEL}</Text>}
      style={styles.row}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.control,
    backgroundColor: Colors.light.backgroundElement,
  },
  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    letterSpacing: 0.1,
    textDecorationLine: 'underline',
    color: Colors.light.onSurfaceVariant,
  },
});
