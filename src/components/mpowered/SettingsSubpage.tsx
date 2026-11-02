import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode, useState } from 'react';

import { Colors } from '@/constants/theme';
export function SettingsSubpage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {/* The whole page scrolls, so nothing is cut off on a small phone or with large text. */}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{title}</Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export const settingsSubpageStyles = StyleSheet.create({
  placeholder: {
    color: Colors.light.textSecondary,
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
  link: {
    minHeight: scaleHeight(48),
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.divider,
  },
  linkText: {
    color: Colors.light.primary,
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
});

export function SettingsOption({
  icon,
  label,
  onPress,
  trailing,
  destructive = false,
  elevated = false,
  accessibilityLabel,
}: {
  icon?: number;
  label: string;
  onPress?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
  elevated?: boolean;
  /** What a screen reader says for the row, when `trailing` shows something it should hear too. Defaults to `label`. */
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? label}
      style={({ pressed }) => [styles.option, elevated && styles.optionElevated, pressed && styles.optionPressed]}
    >
      {icon && <Image source={icon} style={styles.optionIcon} contentFit="contain" accessibilityLabel="" />}
      <Text style={[styles.optionLabel, destructive && styles.destructiveText]}>{label}</Text>
      {trailing ?? (onPress && <Text style={[styles.optionArrow, destructive && styles.destructiveText]}>→</Text>)}
    </Pressable>
  );
}

export function SettingsToggle({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: value }}
      style={[styles.toggle, value && styles.toggleOn]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
  );
}

export function SettingsSelect({
  value,
  options,
  onChange,
  accessibilityLabel = 'Text size',
}: {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  accessibilityLabel?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.selectWrapper}>
      <Pressable
        onPress={() => setIsOpen(current => !current)}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}, ${value}`}
        accessibilityState={{ expanded: isOpen }}
        style={styles.select}
      >
        <Text style={styles.selectText}>{value}</Text>
        <Text style={styles.selectArrow}>⌄</Text>
      </Pressable>
      {isOpen && (
        <View style={styles.selectMenu}>
          {options.map(option => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setIsOpen(false);
              }}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: option === value }}
              style={styles.selectOption}
            >
              <Text style={styles.selectOptionText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  title: {
    marginBottom: scaleHeight(24),
    color: Colors.light.text,
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleHeight(29),
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(24),
    paddingBottom: scaleHeight(24),
  },
  option: {
    minHeight: scaleHeight(56),
    paddingHorizontal: scaleWidth(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(16),
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: scaleWidth(12),
    marginBottom: scaleHeight(16),
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionElevated: {
    zIndex: 10,
    elevation: 10,
  },
  optionIcon: {
    width: scaleWidth(24),
    height: scaleWidth(24),
  },
  optionLabel: {
    flex: 1,
    color: Colors.light.text,
    fontSize: scaleFont(20),
    lineHeight: scaleHeight(24),
  },
  optionArrow: {
    color: Colors.light.text,
    fontSize: scaleFont(26),
    lineHeight: scaleFont(26),
  },
  destructiveText: {
    color: Colors.light.error,
  },
  toggle: {
    width: scaleWidth(72),
    height: scaleHeight(40),
    padding: scaleWidth(4),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: scaleWidth(20),
    backgroundColor: Colors.light.surfaceContainer,
  },
  toggleOn: {
    backgroundColor: Colors.light.secondaryContainer,
  },
  toggleThumb: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: scaleWidth(14),
    backgroundColor: Colors.light.secondaryContainer,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primary,
  },
  select: {
    minWidth: scaleWidth(106),
    height: scaleHeight(38),
    paddingHorizontal: scaleWidth(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: scaleWidth(4),
  },
  selectWrapper: {
    position: 'relative',
    zIndex: 2,
  },
  selectMenu: {
    position: 'absolute',
    top: scaleHeight(42),
    right: 0,
    minWidth: scaleWidth(106),
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: scaleWidth(4),
    backgroundColor: Colors.light.surface,
    elevation: 4,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selectOption: {
    minHeight: scaleHeight(40),
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(12),
  },
  selectOptionText: {
    color: Colors.light.textSecondary,
    fontSize: scaleFont(16),
  },
  selectText: {
    color: Colors.light.textSecondary,
    fontSize: scaleFont(16),
  },
  selectArrow: {
    color: Colors.light.textSecondary,
    fontSize: scaleFont(20),
  },
});
