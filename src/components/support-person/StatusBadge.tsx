import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, Radius, Spacing, type ThemeColor } from '@/constants/theme';

const VARIANTS: Record<'upcoming' | 'none', { label: string; background: string; text: ThemeColor }> = {
  upcoming: {
    label: 'Appointment upcoming',
    background: Colors.light.warningContainer,
    text: 'onWarningContainer',
  },
  none: {
    label: 'No scheduled appointments',
    background: Colors.light.successContainer,
    text: 'onSuccessContainer',
  },
};

/** Yellow "Appointment upcoming" or green "No scheduled appointments" pill (Figma 3911-24657, 3911-24634). */
export function StatusBadge({ hasUpcoming }: { hasUpcoming: boolean }) {
  const variant = VARIANTS[hasUpcoming ? 'upcoming' : 'none'];

  return (
    <View style={[styles.badge, { backgroundColor: variant.background }]}>
      <AppText variant="labelSmall" color={variant.text} numberOfLines={1}>
        {variant.label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.mid,
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
});
