import { Text } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { Radius, Spacing, Typography, makeStyles } from '@/constants/theme';

type RecordingConsentRowProps = {
  /** True once the consent has been signed. The tick is set by that, not by tapping the row. */
  checked: boolean;
  /** Opens the consent screen where the signature is collected. */
  onPress: () => void;
};

const CONSENT_LABEL = 'Ask consent for recording answers (Required)';

/** The row for consent to record answers. Tapping it opens the consent screen. */
export function RecordingConsentRow({ checked, onPress }: RecordingConsentRowProps) {
  const styles = useStyles();
  return (
    <Checkbox
      checked={checked}
      onChange={onPress}
      accessibilityLabel={CONSENT_LABEL}
      label={<Text style={styles.label}>{CONSENT_LABEL}</Text>}
      style={styles.row}
    />
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.control,
    backgroundColor: colors.backgroundElement,
  },
  label: {
    ...Typography.labelLargeBold,
    textDecorationLine: 'underline',
    color: colors.onSurfaceVariant,
  },
}));
