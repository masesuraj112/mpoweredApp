import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Colors, Spacing } from '@/constants/theme';
import type { ReviewMode } from '@/features/care-planner/reviewMode';

type PlanActionBarProps = {
  /**
   * `saved` (the normal screen): the "Add or Modify Questions" button, which stays disabled until
   * recording consent is signed. `first-time` (a draft appointment): a purple "Save" that is
   * always enabled and not gated by consent.
   */
  mode?: ReviewMode;
  /** Recording consent has been signed. Only matters in `saved` mode. */
  consented: boolean;
  onModifyQuestions: () => void;
  /** Saves the new appointment (first-time mode). */
  onSave?: () => void;
  saving?: boolean;
};

/** Bar at the bottom of the review screen. It sits below the scrolling content, never over it. */
export function PlanActionBar({
  mode = 'saved',
  consented,
  onModifyQuestions,
  onSave,
  saving = false,
}: PlanActionBarProps) {
  if (mode === 'first-time') {
    return (
      <View style={styles.bar}>
        <Button
          label={saving ? 'Saving…' : 'Save'}
          accessibilityLabel={saving ? 'Saving appointment' : 'Save'}
          variant="primary"
          disabled={saving}
          onPress={onSave ?? (() => {})}
          style={styles.button}
        />
      </View>
    );
  }

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
