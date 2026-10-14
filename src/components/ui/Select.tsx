import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

import { fieldStyles } from './fieldStyles';
import { CheckIcon, ChevronDownIcon } from './icons';

export type SelectOption = {
  /** Shown to the person and passed to `onChange`. */
  label: string;
};

type SelectProps = {
  label: string;
  /** Small text under the label, for example "optional". */
  hint?: string;
  placeholder: string;
  options: readonly SelectOption[];
  /** The chosen option's label, or null for nothing chosen. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** Shows a "Clear selection" row while something is chosen. */
  clearable?: boolean;
  clearLabel?: string;
};

/** A field that opens a list of options. Android back closes the list without changing anything. */
export function Select({
  label,
  hint,
  placeholder,
  options,
  value,
  onChange,
  clearable = false,
  clearLabel = 'Clear selection',
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const { height } = useWindowDimensions();

  const choose = (next: string | null) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {hint ? <Text style={fieldStyles.optional}>{hint}</Text> : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}${hint ? `, ${hint}` : ''}`}
        accessibilityValue={{ text: value ?? placeholder }}
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen(true)}
        style={fieldStyles.box}>
        <Text style={[fieldStyles.value, value === null && fieldStyles.placeholder]}>
          {value ?? placeholder}
        </Text>
        <ChevronDownIcon />
      </Pressable>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable
          accessibilityLabel="Close list"
          accessibilityRole="button"
          onPress={() => setOpen(false)}
          style={styles.backdrop}>
          <Pressable
            accessibilityViewIsModal
            style={[styles.sheet, { maxHeight: height * 0.7 }]}
            // Taps on the sheet itself should not reach the backdrop.
            onPress={() => {}}>
            <Text accessibilityRole="header" style={styles.title}>
              {label}
            </Text>
            <ScrollView>
              {options.map((option) => {
                const selected = option.label === value;
                return (
                  <Pressable
                    key={option.label}
                    accessibilityRole="radio"
                    accessibilityLabel={option.label}
                    accessibilityState={{ selected }}
                    onPress={() => choose(option.label)}
                    style={[styles.option, selected && styles.optionSelected]}>
                    <Text style={styles.optionText}>{option.label}</Text>
                    {selected ? <CheckIcon color={Colors.light.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
            {clearable && value !== null ? (
              <View style={styles.clear}>
                <Button label={clearLabel} variant="tonal" onPress={() => choose(null)} />
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
    backgroundColor: Colors.light.backdrop,
  },
  sheet: {
    width: '100%',
    maxWidth: 440,
    borderRadius: Radius.card,
    backgroundColor: Colors.light.background,
    paddingVertical: Spacing.two,
    overflow: 'hidden',
  },
  title: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: Colors.light.onSurface,
  },
  option: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  optionSelected: {
    backgroundColor: Colors.light.primaryContainer,
  },
  optionText: {
    ...Typography.bodyLarge,
    flex: 1,
    minWidth: 0,
    color: Colors.light.onSurface,
  },
  clear: {
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
});
