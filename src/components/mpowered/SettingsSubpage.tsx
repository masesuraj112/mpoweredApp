import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { ReactNode } from 'react';

import { NativePicker } from '@/components/ui/NativePicker';
import { NativeSwitch } from '@/components/ui/NativeSwitch';
import { makeStyles } from '@/constants/theme';
export function SettingsSubpage({ title, children }: { title: string; children: ReactNode }) {
  const styles = useStyles();
  return (
    <>
      {/* The page title lives in the native header (a large title on iOS, as in the Settings app). */}
      <Stack.Screen options={{ title, headerLargeTitle: true }} />
      {/* The whole page scrolls, so nothing is cut off on a small phone or with large text. The scroll view
          sits under the native header, which sets its insets. */}
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </>
  );
}

export const useSettingsSubpageStyles = makeStyles((colors) => ({
  placeholder: {
    color: colors.textSecondary,
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
  link: {
    minHeight: scaleHeight(48),
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  linkText: {
    color: colors.primary,
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
}));

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
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
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
    borderColor: colors.outline,
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
    color: colors.text,
    fontSize: scaleFont(20),
    lineHeight: scaleHeight(24),
  },
  optionArrow: {
    color: colors.text,
    fontSize: scaleFont(26),
    lineHeight: scaleFont(26),
  },
  destructiveText: {
    color: colors.error,
  },
}));
