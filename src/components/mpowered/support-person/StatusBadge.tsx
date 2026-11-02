import { Radius, Spacing, type ThemeColors, Typography, useThemeColors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

const VARIANTS = {
  upcoming: { label: 'Appointment upcoming', background: 'warningContainer', text: 'warning' },
  none: { label: 'No scheduled appointments', background: 'successContainer', text: 'success' },
} as const satisfies Record<string, { label: string; background: keyof ThemeColors; text: keyof ThemeColors }>;

/** Yellow "Appointment upcoming" or green "No scheduled appointments" pill (Figma 3911-24657, 3911-24634). */
export function StatusBadge({ hasUpcoming }: { hasUpcoming: boolean }) {
  const colors = useThemeColors();
  const variant = VARIANTS[hasUpcoming ? 'upcoming' : 'none'];

  return (
    <View style={[styles.badge, { backgroundColor: colors[variant.background] }]}>
      <Text style={[styles.label, { color: colors[variant.text] }]} numberOfLines={1}>
        {variant.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 27,
    paddingHorizontal: Spacing.two,
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  label: {
    ...Typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
