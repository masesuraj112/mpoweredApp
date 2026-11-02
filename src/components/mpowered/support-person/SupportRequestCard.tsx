import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';
import { Pressable, Text, View } from 'react-native';

type SupportRequestCardProps = {
  patientName: string;
  onAccept: () => void;
  onReject: () => void;
};

/** "<Name> has added you as a support person" with Reject and Accept (Figma 3911-24816). */
export function SupportRequestCard({ patientName, onAccept, onReject }: SupportRequestCardProps) {
  const styles = useStyles();
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

const useStyles = makeStyles((colors) => ({
  card: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
  },
  message: {
    color: colors.onSurface,
    ...Typography.bodyLarge,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.four,
    paddingHorizontal: Spacing.one,
  },
  button: {
    flex: 1,
    minHeight: MinTapTarget,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.control,
  },
  pressed: {
    opacity: 0.8,
  },
  reject: {
    backgroundColor: colors.primaryContainer,
  },
  accept: {
    backgroundColor: colors.primary,
  },
  buttonText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  rejectText: {
    color: colors.text,
  },
  acceptText: {
    color: colors.onPrimary,
  },
}));
