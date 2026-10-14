import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/theme';

type AppointmentDetailsActionBarProps = {
  saving: boolean;
  onSave: () => void;
};

/** Bar at the bottom of the screen. It sits below the scrolling content, never over it. */
export function AppointmentDetailsActionBar({ saving, onSave }: AppointmentDetailsActionBarProps) {
  return (
    <View style={styles.bar}>
      <Button
        label={saving ? 'Saving…' : 'Next'}
        accessibilityLabel={saving ? 'Saving appointment' : 'Next'}
        variant="primary"
        disabled={saving}
        onPress={onSave}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.five,
    borderTopWidth: 2,
    borderTopColor: Colors.light.backgroundElement,
    backgroundColor: Colors.light.background,
  },
  button: {
    width: '100%',
    maxWidth: 250,
  },
});
