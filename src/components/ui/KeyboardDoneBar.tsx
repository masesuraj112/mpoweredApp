import { useId } from 'react';
import { InputAccessoryView, Keyboard, Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Colors, MinTapTarget, Spacing } from '@/constants/theme';

/**
 * A "Done" bar shown above the iOS keyboard, for keyboards with no way to close them: multiline
 * inputs (return adds a new line) and number / phone pads (no return key at all). Ignored on
 * Android, which has its own hide key.
 *
 * Pass `id` as the input's `inputAccessoryViewID` and render `bar` once, after that input.
 * iOS links each bar to only the first input in the whole app with a matching ID, and earlier
 * screens stay mounted, so every bar gets its own ID rather than sharing one.
 */
export function useKeyboardDoneBar() {
  const id = useId();
  return { id, bar: <KeyboardDoneBar nativeID={id} /> };
}

function KeyboardDoneBar({ nativeID }: { nativeID: string }) {
  if (Platform.OS !== 'ios') return null;

  return (
    <InputAccessoryView nativeID={nativeID}>
      <View style={styles.bar}>
        <Pressable
          onPress={Keyboard.dismiss}
          accessibilityRole="button"
          accessibilityLabel="Done, close keyboard"
          style={styles.done}
        >
          <AppText variant="titleMedium" color="primary">
            Done
          </AppText>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.three,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.outline,
    backgroundColor: Colors.light.surfaceContainer,
  },
  done: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
  },
});
