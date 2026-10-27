import { Colors } from '@/constants/theme';
import { getInitials } from '@/features/support-person/appointments';
import { scaleFont, scaleWidth } from '@/services/scale';
import { StyleSheet, Text, View } from 'react-native';

/** Purple initials in a light circle, e.g. "JC" for Jane Cooper (Figma 3911-24650). */
export function InitialsAvatar({ name, size = 35 }: { name: string; size?: number }) {
  const diameter = scaleWidth(size);

  return (
    <View
      style={[styles.circle, { width: diameter, height: diameter, borderRadius: diameter / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Text scales with the circle; 15pt at the design's 35pt size. */}
      <Text style={[styles.initials, { fontSize: scaleFont((size * 15) / 35) }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceContainer,
  },
  initials: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
