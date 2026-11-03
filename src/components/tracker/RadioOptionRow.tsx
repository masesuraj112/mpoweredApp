import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Spacing } from '@/constants/theme';

type RadioOptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** The last row has no rule under it. */
  isLast?: boolean;
};

/**
 * One answer in a pick-one list. The whole row is the tap target and grows with its text, so long
 * options and large system text wrap and the list scrolls instead of clipping.
 */
export function RadioOptionRow({ label, selected, onPress, isLast = false }: RadioOptionRowProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.row, !isLast && styles.rule]}>
      <View style={[styles.circle, selected && styles.circleSelected]}>
        {selected ? <View style={styles.dot} /> : null}
      </View>
      <AppText variant="bodyMedium" color="onSurface" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const CIRCLE_SIZE = 20;
const DOT_SIZE = 10;

const styles = StyleSheet.create({
  row: {
    minHeight: MinTapTarget + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline,
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: Colors.light.onSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  circleSelected: {
    borderColor: Colors.light.controlChecked,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.light.controlChecked,
  },
  label: {
    flex: 1,
    minWidth: 0,
  },
});
