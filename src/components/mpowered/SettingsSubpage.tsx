import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { Pressable, ScrollView, Text } from 'react-native';
import { ReactNode } from 'react';

import { NativePicker } from '@/components/ui/NativePicker';
import { NativeSwitch } from '@/components/ui/NativeSwitch';
import { ContentColumn, makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
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
    ...Typography.bodyLarge,
  },
  link: {
    minHeight: 48,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  linkText: {
    color: colors.primary,
    ...Typography.bodyLarge,
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
    ...ContentColumn,
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.four,
  },
  option: {
    minHeight: 56,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: Radius.card,
    marginBottom: Spacing.three,
    backgroundColor: colors.surfaceContainer,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionElevated: {
    zIndex: 10,
    elevation: 10,
  },
  optionIcon: {
    width: 24,
    height: 24,
  },
  optionLabel: {
    flex: 1,
    color: colors.text,
    ...Typography.titleSmall,
    fontWeight: '400',
  },
  optionArrow: {
    color: colors.text,
    ...Typography.headline,
    fontWeight: '400',
  },
  destructiveText: {
    color: colors.error,
  },
}));
