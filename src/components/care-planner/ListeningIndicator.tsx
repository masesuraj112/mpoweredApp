import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/theme';

type ListeningIndicatorProps = {
  listening: boolean;
  /** Short non-blocking message about dictation (permission, unavailable, no speech...). */
  message: string | null;
  /** Offer a button that opens the phone's settings. */
  onOpenSettings?: () => void;
};

/** "Listening…" while dictating, otherwise a short message about why dictation is not running. */
export function ListeningIndicator({ listening, message, onOpenSettings }: ListeningIndicatorProps) {
  if (listening) {
    return (
      <Text accessibilityLiveRegion="polite" style={[styles.text, styles.listening]}>
        Listening…
      </Text>
    );
  }
  if (!message) return null;
  return (
    <View style={styles.message}>
      <Text accessibilityLiveRegion="polite" style={styles.text}>
        {message}
      </Text>
      {onOpenSettings ? (
        <Button label="Open settings" variant="tonal" onPress={onOpenSettings} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    gap: Spacing.two,
    alignItems: 'flex-start',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0.25,
    color: Colors.light.text,
  },
  listening: {
    color: Colors.light.listening,
    fontWeight: '700',
  },
});
