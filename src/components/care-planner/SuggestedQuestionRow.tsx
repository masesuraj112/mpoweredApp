import { Text } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { Spacing, Typography, makeStyles } from '@/constants/theme';

type SuggestedQuestionRowProps = {
  text: string;
  checked: boolean;
  onToggle: () => void;
  /** Spoken label for the checkbox. */
  accessibilityLabel: string;
};

/** One suggested question with a checkbox. The whole row is the tap target. */
export function SuggestedQuestionRow({
  text,
  checked,
  onToggle,
  accessibilityLabel,
}: SuggestedQuestionRowProps) {
  const styles = useStyles();
  return (
    <Checkbox
      checked={checked}
      onChange={onToggle}
      accessibilityLabel={accessibilityLabel}
      label={<Text style={styles.text}>{text}</Text>}
      style={styles.row}
    />
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: colors.backgroundElement,
  },
  text: {
    ...Typography.bodyLarge,
    color: colors.onSurface,
  },
}));
