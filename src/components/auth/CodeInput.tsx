import { useRef } from 'react';
import { Pressable, TextInput, View, type TextInputInstance } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { makeStyles, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { focusCodeInput } from '@/features/auth/focusCodeInput';

// The boxes share the row, but never grow past this width each.
const CELL_MAX_WIDTH = 48;

type CodeInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  /** How many digits the code has. */
  length: number;
  /** Links the box to a keyboard Done bar (see `useKeyboardDoneBar`), as the number pad has no return key. */
  inputAccessoryViewID?: string;
};

/**
 * The verification code as one box per digit. Underneath is a single real text input that the boxes only
 * display, so the phone's code suggestion and paste still work. Tapping any box opens the keyboard.
 */
export function CodeInput({ value, onChangeText, length, inputAccessoryViewID }: CodeInputProps) {
  const styles = useStyles();
  const inputRef = useRef<TextInputInstance>(null);

  return (
    <View style={[styles.row, { maxWidth: length * CELL_MAX_WIDTH + (length - 1) * Spacing.two }]}>
      {Array.from({ length }, (_, index) => (
        <Pressable
          key={index}
          accessibilityRole="button"
          accessibilityLabel={`Enter verification code, digit ${index + 1}`}
          onPress={() => focusCodeInput(inputRef.current)}
          style={styles.cell}
        >
          <AppText variant="bodyLarge" color="text">
            {value[index] ?? ''}
          </AppText>
        </Pressable>
      ))}
      <TextInput
        ref={inputRef}
        // Open the keyboard (and the iOS code suggestion) as soon as the screen shows.
        autoFocus
        accessibilityLabel="Verification code"
        autoComplete="one-time-code"
        keyboardType="number-pad"
        inputAccessoryViewID={inputAccessoryViewID}
        maxLength={length}
        onChangeText={onChangeText}
        value={value}
        style={styles.hiddenInput}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignSelf: 'center',
    width: '100%',
  },
  cell: {
    flex: 1,
    minHeight: MinTapTarget + Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outlineMedium,
    borderRadius: Radius.small,
    backgroundColor: colors.surfaceContainer,
  },
  // The real input stays invisible: the boxes above show what has been typed.
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
}));
