import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Radius, Spacing } from '@/constants/theme';

type SupportRequestCardProps = {
  patientName: string;
  onAccept: () => void;
  onReject: () => void;
};

/** "<Name> has added you as a support person" with Reject and Accept (Figma 3911-24816). */
export function SupportRequestCard({ patientName, onAccept, onReject }: SupportRequestCardProps) {
  return (
    <View style={styles.card}>
      <AppText variant="titleMedium" color="onSurface">
        {patientName} has added you as a support person
      </AppText>
      <View style={styles.buttons}>
        <Pressable
          onPress={onReject}
          accessibilityRole="button"
          accessibilityLabel={`Reject request from ${patientName}`}
          style={({ pressed }) => [styles.button, styles.reject, pressed && styles.pressed]}
        >
          <AppText variant="labelLarge" color="text">
            Reject
          </AppText>
        </Pressable>
        <Pressable
          onPress={onAccept}
          accessibilityRole="button"
          accessibilityLabel={`Accept request from ${patientName}`}
          style={({ pressed }) => [styles.button, styles.accept, pressed && styles.pressed]}
        >
          <AppText variant="labelLarge" color="onPrimary">
            Accept
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.mid,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radius.extraLarge,
    backgroundColor: Colors.light.surfaceContainer,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.four,
  },
  button: {
    flex: 1,
    minHeight: MinTapTarget,
    paddingHorizontal: Spacing.three,
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
    backgroundColor: Colors.light.primaryContainer,
  },
  accept: {
    backgroundColor: Colors.light.primary,
  },
});
