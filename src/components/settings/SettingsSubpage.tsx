import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ChevronDownIcon } from '@/components/ui/icons';
import { Screen } from '@/components/ui/Screen';
import { Colors, Elevation, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

/** A settings page: its title, then the content. The whole page scrolls, so nothing is cut off on a small phone or with large text. */
export function SettingsSubpage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Screen keyboardShouldPersistTaps="handled">
      <AppText accessibilityRole="header" variant="headlineSmall" style={styles.title}>
        {title}
      </AppText>
      {children}
    </Screen>
  );
}

export const settingsSubpageStyles = StyleSheet.create({
  placeholder: {
    ...Typography.bodyLarge,
    color: Colors.light.onSurfaceVariant,
  },
  link: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.outline,
  },
  linkText: {
    ...Typography.bodyLarge,
    color: Colors.light.primary,
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
      <AppText variant="bodyLarge" color={destructive ? 'error' : 'onSurface'} style={styles.optionLabel}>
        {label}
      </AppText>
      {trailing ??
        (onPress && (
          <AppText
            accessibilityElementsHidden
            importantForAccessibility="no"
            variant="headlineSmall"
            color={destructive ? 'error' : 'text'}
          >
            →
          </AppText>
        ))}
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
      // The track is 40dp tall; the extra hit area makes the tap target 48dp.
      hitSlop={Spacing.one}
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
        onPress={() => setIsOpen((current) => !current)}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel}, ${value}`}
        accessibilityState={{ expanded: isOpen }}
        style={styles.select}
      >
        <AppText variant="bodyLarge" color="onSurfaceVariant">
          {value}
        </AppText>
        <ChevronDownIcon color={Colors.light.onSurfaceVariant} />
      </Pressable>
      {isOpen && (
        <View style={styles.selectMenu}>
          {options.map((option) => (
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
              <AppText variant="bodyLarge" color="onSurfaceVariant">
                {option}
              </AppText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const ICON_SIZE = 24;
const TOGGLE_THUMB = 28;

const styles = StyleSheet.create({
  title: {
    marginBottom: Spacing.four,
  },
  option: {
    minHeight: MinTapTarget + Spacing.two,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.card,
    marginBottom: Spacing.three,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionElevated: {
    zIndex: 10,
    elevation: 10,
  },
  optionIcon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
  },
  optionLabel: {
    flex: 1,
  },
  toggle: {
    width: 72,
    height: 40,
    padding: Spacing.one,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.extraLarge,
    backgroundColor: Colors.light.surfaceContainer,
  },
  toggleOn: {
    backgroundColor: Colors.light.secondaryContainer,
  },
  toggleThumb: {
    width: TOGGLE_THUMB,
    height: TOGGLE_THUMB,
    borderRadius: TOGGLE_THUMB / 2,
    backgroundColor: Colors.light.secondary,
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.primary,
  },
  select: {
    minWidth: 112,
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.small,
  },
  // The menu floats over the content below the select, so it is positioned over it.
  selectWrapper: {
    position: 'relative',
    zIndex: 2,
  },
  selectMenu: {
    position: 'absolute',
    top: MinTapTarget + Spacing.one,
    right: 0,
    minWidth: 112,
    borderWidth: 1,
    borderColor: Colors.light.outlineStrong,
    borderRadius: Radius.small,
    backgroundColor: Colors.light.background,
    ...Elevation.level1,
  },
  selectOption: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.mid,
  },
});
