import { StyleSheet, Text } from 'react-native';

import { Checkbox } from '@/components/ui/Checkbox';
import { Colors, Spacing } from '@/constants/theme';

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

const styles = StyleSheet.create({
  row: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.5,
    color: Colors.light.onSurface,
  },
});
