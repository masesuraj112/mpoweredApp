import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

import { Colors } from '@/constants/theme';
export interface DropdownOption<T extends string> {
  value: T;
  label: string;
}

interface DropdownProps<T extends string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function Dropdown<T extends string>({
  value,
  options,
  onChange,
  accessibilityLabel,
  style,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const handleSelect = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        style={[styles.trigger, style]}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.triggerText}>{selected?.label ?? value}</Text>
        <Text style={styles.chevron}>⌄</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <ScrollView>
              {options.map((option, index) => {
                const isSelected = option.value === value;
                const isLast = index === options.length - 1;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={[styles.option, !isLast && styles.optionDivider]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    {isSelected && <Text style={styles.check}>✓</Text>}
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

const SURFACE = Colors.light.background;
const OUTLINE = Colors.light.outline;
const ACCENT = Colors.light.primary;

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: OUTLINE,
    borderRadius: scaleWidth(4),
    paddingHorizontal: scaleWidth(16),
    paddingVertical: scaleHeight(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  triggerText: {
    fontSize: scaleFont(16),
    color: 'black',
  },
  chevron: {
    fontSize: scaleFont(16),
    color: 'black',
  },
  backdrop: {
    flex: 1,
    backgroundColor: Colors.light.backdrop,
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(32),
  },
  sheet: {
    backgroundColor: 'white',
    borderRadius: scaleWidth(12),
    maxHeight: '70%',
    paddingHorizontal: scaleWidth(16),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(14),
  },
  optionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  optionText: {
    fontSize: scaleFont(16),
    color: 'black',
  },
  optionTextSelected: {
    fontWeight: '600',
    color: ACCENT,
  },
  check: {
    fontSize: scaleFont(16),
    color: ACCENT,
  },
});
