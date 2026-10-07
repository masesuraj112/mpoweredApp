import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode, useState } from 'react';

export function SettingsSubpage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </SafeAreaView>
  );
}

export const settingsSubpageStyles = StyleSheet.create({
  placeholder: {
    color: '#49454F',
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
  link: {
    minHeight: scaleHeight(48),
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  linkText: {
    color: '#6750A4',
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
}: {
  icon?: number;
  label: string;
  onPress?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
  elevated?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
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
    backgroundColor: '#FFFFFF',
  },
  title: {
    marginBottom: scaleHeight(24),
    color: '#000000',
    fontSize: scaleFont(24),
    fontWeight: '600',
    lineHeight: scaleHeight(29),
  },
  content: {
    flex: 1,
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(24),
  },
  option: {
    minHeight: scaleHeight(56),
    paddingHorizontal: scaleWidth(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(16),
    borderWidth: 1,
    borderColor: '#AEAEB2',
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
    color: '#1D1B20',
    fontSize: scaleFont(20),
    lineHeight: scaleHeight(24),
  },
  optionArrow: {
    color: '#000000',
    fontSize: scaleFont(26),
    lineHeight: scaleFont(26),
  },
  destructiveText: {
    color: '#D32F2F',
  },
  toggle: {
    width: scaleWidth(72),
    height: scaleHeight(40),
    padding: scaleWidth(4),
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#AEAEB2',
    borderRadius: scaleWidth(20),
    backgroundColor: '#F3EDF7',
  },
  toggleOn: {
    backgroundColor: '#E8DEF8',
  },
  toggleThumb: {
    width: scaleWidth(28),
    height: scaleWidth(28),
    borderRadius: scaleWidth(14),
    backgroundColor: '#CCC2DC',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#6750A4',
  },
  select: {
    minWidth: scaleWidth(106),
    height: scaleHeight(38),
    paddingHorizontal: scaleWidth(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#AEAEB2',
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
    borderColor: '#AEAEB2',
    borderRadius: scaleWidth(4),
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000000',
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
    color: '#49454F',
    fontSize: scaleFont(16),
  },
  selectText: {
    color: '#49454F',
    fontSize: scaleFont(16),
  },
  selectArrow: {
    color: '#49454F',
    fontSize: scaleFont(20),
  },
});
