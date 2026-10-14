import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/theme';

type PlanActionBarProps = {
  /** Recording consent has been signed. The action stays disabled until it is. */
  consented: boolean;
  onModifyQuestions: () => void;
};

/** Bar at the bottom of the review screen. It sits below the scrolling content, never over it. */
export function PlanActionBar({ consented, onModifyQuestions }: PlanActionBarProps) {
  return (
    <View style={styles.bar}>
      <Button
        label="Add or Modify Questions"
        variant={consented ? 'primary' : 'outlined'}
        disabled={!consented}
        accessibilityHint={consented ? undefined : 'Complete the recording consent to enable'}
        onPress={onModifyQuestions}
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
