import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors } from '@/constants/theme';
import { getInitials } from '@/features/support-person/appointments';

/** Purple initials in a light circle, e.g. "JC" for Jane Cooper (Figma 3911-24650). */
export function InitialsAvatar({ name, size = 35 }: { name: string; size?: number }) {
  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Text scales with the circle; 15pt at the design's 35pt size. */}
      <AppText variant="labelLargeBold" color="primary" style={{ fontSize: (size * 15) / 35 }}>
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceContainer,
  },
});
