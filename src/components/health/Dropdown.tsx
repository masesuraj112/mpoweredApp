import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { fieldStyles } from '@/components/ui/fieldStyles';
import { CheckIcon, ChevronDownIcon } from '@/components/ui/icons';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

export type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type DropdownProps<T extends string> = {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  /** What the dropdown is for, for example "Pain location". Spoken with the chosen value. */
  accessibilityLabel: string;
  /** `field` is a bordered box for forms; `chip` is a small rounded pill for filters. */
  variant?: 'field' | 'chip';
  style?: StyleProp<ViewStyle>;
};

/** A compact picker: a button showing the chosen option that opens a list of the others. */
export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
  variant = 'field',
  style,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);
  const selectedLabel = selected?.label ?? value;

  const handleSelect = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}, ${selectedLabel}`}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={[variant === 'chip' ? styles.chip : fieldStyles.box, style]}>
        <AppText
          numberOfLines={1}
          variant={variant === 'chip' ? 'bodyMedium' : 'bodyLarge'}
          color="onSurface"
          style={styles.triggerText}>
          {selectedLabel}
        </AppText>
        <ChevronDownIcon />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close list"
          style={styles.backdrop}
          onPress={() => setOpen(false)}>
          <View accessibilityViewIsModal style={styles.sheet}>
            <ScrollView>
              {options.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={option.label}
                    onPress={() => handleSelect(option.value)}
                    style={[styles.option, index < options.length - 1 && styles.optionRule]}>
                    <AppText
                      variant="bodyLarge"
                      color={isSelected ? 'controlChecked' : 'onSurface'}
                      style={[styles.optionText, isSelected && styles.optionSelected]}>
                      {option.label}
                    </AppText>
                    {isSelected ? <CheckIcon color={Colors.light.controlChecked} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.surfaceContainer,
  },
  triggerText: {
    flexShrink: 1,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    backgroundColor: Colors.light.backdrop,
  },
  sheet: {
    maxHeight: '70%',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
  },
  option: {
    minHeight: MinTapTarget + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.mid,
  },
  optionRule: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  optionText: {
    flex: 1,
  },
  optionSelected: {
    fontWeight: '600',
  },
});
