import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/theme';

type SupportPersonActionBarProps = {
  saving: boolean;
  onSkip: () => void;
  onSave: () => void;
};

/** Pinned Skip and Save. It sits below the scrolling content, never over it. */
export function SupportPersonActionBar({ saving, onSkip, onSave }: SupportPersonActionBarProps) {
  return (
    <View style={styles.bar}>
      <Button
        label="Skip"
        variant="outlined"
        disabled={saving}
        onPress={onSkip}
        style={styles.button}
      />
      <Button
        label={saving ? 'Saving…' : 'Save'}
        accessibilityLabel={saving ? 'Saving support person' : 'Save'}
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
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderTopWidth: 2,
    borderTopColor: Colors.light.backgroundElement,
    backgroundColor: Colors.light.background,
  },
  button: {
    flex: 1,
    maxWidth: 160,
  },
});
