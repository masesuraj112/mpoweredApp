import { ActionBar } from '@/components/ui/ActionBar';
import { Button } from '@/components/ui/Button';
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
      <ActionBar>
        <Button
          label={saving ? 'Saving…' : 'Save'}
          accessibilityLabel={saving ? 'Saving appointment' : 'Save'}
          variant="primary"
          disabled={saving}
          onPress={onSave ?? (() => {})}
        />
      </ActionBar>
    );
  }

  return (
    <ActionBar>
      <Button
        label="Add or Modify Questions"
        variant={consented ? 'primary' : 'outlined'}
        disabled={!consented}
        accessibilityHint={consented ? undefined : 'Complete the recording consent to enable'}
        onPress={onModifyQuestions}
      />
    </ActionBar>
  );
}
