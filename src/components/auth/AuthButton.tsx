import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/Button';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  /** Pale and not pressable, until the screen has what it needs. */
  disabled?: boolean;
  /** Looks pale but can still be pressed, for a step that explains what is missing when pressed. */
  pale?: boolean;
  busy?: boolean;
  /** Spoken name, when it should stay the same while the label changes (for example "Continue" and "Sending…"). */
  accessibilityLabel?: string;
};

/** The big Continue / Verify button at the bottom of a sign-in step: filled when it can be used, pale when not. */
export function AuthButton({ label, onPress, disabled = false, pale = false, busy = false, accessibilityLabel }: AuthButtonProps) {
  return (
    <Button
      label={label}
      accessibilityLabel={accessibilityLabel}
      variant={disabled || pale ? 'tonal' : 'primary'}
      pill
      disabled={disabled}
      busy={busy}
      onPress={onPress}
      // The pale look is the signal that it is disabled, so do not dim it further.
      style={disabled || pale ? styles.pale : undefined}
    />
  );
}

const styles = StyleSheet.create({
  pale: {
    opacity: 1,
  },
});
