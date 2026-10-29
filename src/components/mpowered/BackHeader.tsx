import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type BackHeaderProps = {
  title: string;
  onBack: () => void;
};

/** Lilac top bar with "‹ Back" on the left and the page title on the right (Settings, appointments). */
export function BackHeader({ title, onBack }: BackHeaderProps) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel="Back" style={styles.backButton}>
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: scaleHeight(109),
    backgroundColor: '#E8DEF8',
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
    color: '#49454F',
    marginRight: scaleWidth(8),
  },
  backText: {
    fontSize: scaleFont(16),
    color: '#49454F',
  },
  title: {
    flexShrink: 1,
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#000000',
    textAlign: 'right',
  },
});
