import { ActionBar } from '@/components/ui/ActionBar';
import { Button } from '@/components/ui/Button';
import type { ReviewMode } from '@/features/care-planner/reviewMode';

type PlanActionBarProps = {
  /**
   * `saved` (the normal screen): the "Add or Modify Questions" button. `first-time` (a draft
   * appointment): a purple "Save". Neither is gated by recording consent; consent is only needed
   * to record the doctor's answers.
   */
  mode?: ReviewMode;
  onModifyQuestions: () => void;
  /** Saves the new appointment (first-time mode). */
  onSave?: () => void;
  saving?: boolean;
};

/** Bar at the bottom of the review screen. It sits below the scrolling content, never over it. */
export function PlanActionBar({
  mode = 'saved',
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
        variant="primary"
        onPress={onModifyQuestions}
      />
    </ActionBar>
  );
}
