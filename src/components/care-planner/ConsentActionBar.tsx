import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/theme';

type ConsentActionBarProps = {
  canSave: boolean;
  saving: boolean;
  onSave: () => void;
};

/** Bar at the bottom of the consent screen. It sits below the scrolling content, never over it. */
export function ConsentActionBar({ canSave, saving, onSave }: ConsentActionBarProps) {
  return (
    <View style={styles.bar}>
      <Button
        label={saving ? 'Saving…' : 'Save'}
        accessibilityLabel={saving ? 'Saving' : 'Save'}
        variant={canSave ? 'primary' : 'outlined'}
        disabled={!canSave}
        accessibilityHint={canSave || saving ? undefined : 'Draw a signature to enable'}
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
