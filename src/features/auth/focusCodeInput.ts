// Opens the keyboard for the hidden one-time-code input when a code box is tapped.
// Pure module: no imports from @/lib/supabase, react-native or expo-*.

/** The parts of a TextInput this needs. */
export type FocusableInput = { focus: () => void; blur: () => void; isFocused: () => boolean };

/**
 * `focus()` does nothing on an input that is already focused, and the keyboard can close while the input
 * stays focused (Android Back, picking the code from the iOS suggestion, or leaving the app to read the
 * SMS). Then the boxes look tappable but nothing happens. So an input that is already focused is blurred
 * first and focused again a moment later, which always brings the keyboard back.
 */
export function focusCodeInput(
  input: FocusableInput | null,
  later: (run: () => void) => void = (run) => setTimeout(run, 50),
): void {
  if (!input) return;
  if (!input.isFocused()) {
    input.focus();
    return;
  }
  input.blur();
  later(() => input.focus());
}
