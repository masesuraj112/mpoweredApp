import { makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';


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
        <Button
          label="Reject"
          variant="outlined"
          onPress={onReject}
          accessibilityLabel={`Reject request from ${patientName}`}
        />
        <Button
          label="Accept"
          variant="primary"
          onPress={onAccept}
          accessibilityLabel={`Accept request from ${patientName}`}
        />
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
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
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
}));
