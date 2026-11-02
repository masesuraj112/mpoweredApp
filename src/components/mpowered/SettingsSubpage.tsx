import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

import { NativePicker } from '@/components/ui/NativePicker';
import { NativeSwitch } from '@/components/ui/NativeSwitch';
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

/** The platform's own switch, for a row's trailing slot. */
export function SettingsToggle({
  value,
  onValueChange,
  accessibilityLabel,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel?: string;
}) {
  return <NativeSwitch value={value} onValueChange={onValueChange} accessibilityLabel={accessibilityLabel} />;
}

/** The platform's own menu picker for a short list of text options. */
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
  return (
    <NativePicker
      value={value}
      options={options.map((option) => ({ value: option, label: option }))}
      onChange={onChange}
      accessibilityLabel={accessibilityLabel}
    />
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
});
