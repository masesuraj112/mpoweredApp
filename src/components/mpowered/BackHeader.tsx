import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Gradients } from '@/constants/theme';
type BackHeaderProps = {
  title: string;
  onBack: () => void;
};

/** Brand-gradient top bar with "‹ Back" on the left and the page title on the right (Settings, appointments). */
export function BackHeader({ title, onBack }: BackHeaderProps) {
  return (
    <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.topBar}>
      {/* The bar runs behind the status bar, so its text must be light to stay readable. */}
      <StatusBar style="light" />
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={styles.backButton}>
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: scaleHeight(109),
    backgroundColor: Colors.light.brandDeep,
    paddingTop: scaleHeight(52),
    paddingHorizontal: scaleWidth(24),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: scaleWidth(16),
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: scaleHeight(40),
  },
  backArrow: {
    fontSize: scaleFont(28),
    lineHeight: scaleFont(28),
    color: Colors.light.onBrandMuted,
    marginRight: scaleWidth(8),
  },
  backText: {
    fontSize: scaleFont(16),
    color: Colors.light.onBrandMuted,
  },
  title: {
    flexShrink: 1,
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: Colors.light.onBrand,
    textAlign: 'right',
  },
});
