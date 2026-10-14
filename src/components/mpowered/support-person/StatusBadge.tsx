import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { StyleSheet, Text, View } from 'react-native';

const VARIANTS = {
  upcoming: { label: 'Appointment upcoming', backgroundColor: '#FFF3CD', color: '#92400E' },
  none: { label: 'No scheduled appointments', backgroundColor: '#C5E9C5', color: '#3D9C31' },
} as const;

/** Yellow "Appointment upcoming" or green "No scheduled appointments" pill (Figma 3911-24657, 3911-24634). */
export function StatusBadge({ hasUpcoming }: { hasUpcoming: boolean }) {
  const variant = VARIANTS[hasUpcoming ? 'upcoming' : 'none'];

  return (
    <View style={[styles.badge, { backgroundColor: variant.backgroundColor }]}>
      <Text style={[styles.label, { color: variant.color }]} numberOfLines={1}>
        {variant.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: scaleHeight(27),
    paddingHorizontal: scaleWidth(10),
    justifyContent: 'center',
    borderRadius: 999,
  },
  label: {
    fontSize: scaleFont(11),
    fontWeight: '600',
    lineHeight: 16,
    letterSpacing: 0.5,
  },
});
