import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.button} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: scaleHeight(48),
    paddingHorizontal: scaleWidth(24),
  },
  message: {
    fontSize: scaleFont(14),
    lineHeight: scaleFont(20),
    color: '#1D1B20',
    textAlign: 'center',
  },
  button: {
    marginTop: scaleHeight(16),
    backgroundColor: '#F2F2F7',
    borderRadius: scaleWidth(12),
    paddingHorizontal: scaleWidth(20),
    paddingVertical: scaleHeight(10),
  },
  buttonText: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    color: '#1D1B20',
  },
});
