import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

type CheckboxOptionRowProps = {
  label: string;
  /** A smaller line under the label. */
  supportingText?: string;
  selected: boolean;
  onPress: () => void;
  /** The last row has no rule under it. */
  isLast?: boolean;
};

/**
 * One answer in a pick-any list. The whole row is the tap target and grows with its text, so long
 * options and large system text wrap and the list scrolls instead of clipping.
 */
export function CheckboxOptionRow({ label, supportingText, selected, onPress, isLast = false }: CheckboxOptionRowProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.row, !isLast && styles.rule]}>
      <View style={styles.textColumn}>
        <AppText variant="bodyMedium" color="onSurface">
          {label}
        </AppText>
        {supportingText ? (
          <AppText variant="bodySmall" color="onSurface">
            {supportingText}
          </AppText>
        ) : null}
      </View>
      <View style={[styles.box, selected && styles.boxSelected]}>
        {selected ? (
          <AppText
            accessibilityElementsHidden
            importantForAccessibility="no"
            variant="labelMedium"
            color="onPrimary">
            ✓
          </AppText>
        ) : null}
      </View>
    </Pressable>
  );
}

const BOX_SIZE = 20;

const styles = StyleSheet.create({
  row: {
    minHeight: MinTapTarget + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: Radius.small,
    borderWidth: 2,
    borderColor: Colors.light.onSurfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxSelected: {
    borderColor: Colors.light.controlChecked,
    backgroundColor: Colors.light.controlChecked,
  },
});
