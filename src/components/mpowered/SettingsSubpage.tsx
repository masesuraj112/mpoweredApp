import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReactNode } from 'react';

export function SettingsSubpage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Back"
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>‹</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>{children}</View>
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
}: {
  icon?: number;
  label: string;
  onPress?: () => void;
  trailing?: ReactNode;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
    >
      {icon && <Image source={icon} style={styles.optionIcon} contentFit="contain" accessibilityLabel="" />}
      <Text style={[styles.optionLabel, destructive && styles.destructiveText]}>{label}</Text>
      {trailing ?? (onPress && <Text style={[styles.optionArrow, destructive && styles.destructiveText]}>→</Text>)}
    </Pressable>
  );
}

export function SettingsToggle({ value, onValueChange }: { value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={[styles.toggle, value && styles.toggleOn]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </Pressable>
  );
}

export function SettingsSelect({ value }: { value: string }) {
  return (
    <View style={styles.select}>
      <Text style={styles.selectText}>{value}</Text>
      <Text style={styles.selectArrow}>⌄</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: scaleWidth(24),
    paddingTop: scaleHeight(12),
    paddingBottom: scaleHeight(16),
    borderBottomWidth: 1,
    borderBottomColor: '#CAC4D0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scaleHeight(40),
  },
  backArrow: {
    color: '#49454F',
    fontSize: scaleFont(28),
    lineHeight: scaleFont(28),
    marginRight: scaleWidth(8),
  },
  backText: {
    color: '#49454F',
    fontSize: scaleFont(16),
  },
  title: {
    marginTop: scaleHeight(12),
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
  selectText: {
    color: '#49454F',
    fontSize: scaleFont(16),
  },
  selectArrow: {
    color: '#49454F',
    fontSize: scaleFont(20),
  },
});
