import { Colors, Radius } from '@/constants/theme';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SupportRequestCardProps = {
  patientName: string;
  onAccept: () => void;
  onReject: () => void;
};

/** "<Name> has added you as a support person" with Reject and Accept (Figma 3911-24816). */
export function SupportRequestCard({ patientName, onAccept, onReject }: SupportRequestCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.message}>{patientName} has added you as a support person</Text>
      <View style={styles.buttons}>
        <Pressable
          onPress={onReject}
          accessibilityRole="button"
          accessibilityLabel={`Reject request from ${patientName}`}
          style={({ pressed }) => [styles.button, styles.reject, pressed && styles.pressed]}
        >
          <Text style={[styles.buttonText, styles.rejectText]}>Reject</Text>
        </Pressable>
        <Pressable
          onPress={onAccept}
          accessibilityRole="button"
          accessibilityLabel={`Accept request from ${patientName}`}
          style={({ pressed }) => [styles.button, styles.accept, pressed && styles.pressed]}
        >
          <Text style={[styles.buttonText, styles.acceptText]}>Accept</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: scaleHeight(16),
    paddingTop: scaleHeight(22),
    paddingBottom: scaleHeight(15),
    paddingHorizontal: scaleWidth(16),
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: scaleWidth(20),
    backgroundColor: '#F5EFF7',
  },
  message: {
    color: Colors.light.onSurface,
    fontSize: scaleFont(16),
    fontWeight: '500',
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  buttons: {
    flexDirection: 'row',
    gap: scaleWidth(24),
    paddingHorizontal: scaleWidth(3),
  },
  button: {
    flex: 1,
    minHeight: scaleHeight(31),
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.light.outline,
    borderRadius: Radius.pill,
  },
  pressed: {
    opacity: 0.8,
  },
  reject: {
    backgroundColor: '#EADDFF',
  },
  accept: {
    backgroundColor: Colors.light.primary,
  },
  buttonText: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  rejectText: {
    color: Colors.light.text,
  },
  acceptText: {
    color: '#FEF7FF',
  },
});
