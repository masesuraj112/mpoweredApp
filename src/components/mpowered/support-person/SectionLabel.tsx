import { scaleFont } from '@/services/scale';
import { StyleSheet, Text } from 'react-native';

/** Small grey uppercase heading, e.g. "YOUR PERMISSIONS" or "UPCOMING APPOINTMENT". */
export function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={styles.label} accessibilityRole="header">
      {children.toUpperCase()}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    color: 'rgba(60, 60, 67, 0.45)',
    fontSize: scaleFont(11),
    fontWeight: '600',
    lineHeight: 16.5,
    letterSpacing: 0.6,
  },
});
