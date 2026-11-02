import { Button } from '@/components/ui/Button';

type PillButtonProps = {
  label: string;
  onPress: () => void;
  /** Kept for existing callers; the native button sizes itself. */
  size?: 'small' | 'large';
};

/** A support person's main action on a card ("Add questions", "View more appointments"), with an arrow. */
export function PillButton({ label, onPress }: PillButtonProps) {
  return <Button label={label} trailingGlyph="→" variant="primary" onPress={onPress} />;
}
