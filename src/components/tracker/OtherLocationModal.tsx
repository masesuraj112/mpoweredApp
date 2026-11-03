import { useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { makeStyles, MinTapTarget, Radius, Spacing, useThemeColors } from '@/constants/theme';

import { useInputStyles } from './inputStyles';

type OtherLocationModalProps = {
  /** Locations the person entered before, offered as one-tap suggestions. */
  previousLocations: readonly string[];
  onCancel: () => void;
  /** Called with the trimmed text; not called when the box is empty. */
  onSave: (location: string) => void;
};

/**
 * The popup for typing a pain location that is not in the list. Mount it when it should be open:
 * each mount starts with an empty box.
 */
export function OtherLocationModal({ previousLocations, onCancel, onSave }: OtherLocationModalProps) {
  const styles = useStyles();
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
  const [draft, setDraft] = useState('');
  const doneBar = useKeyboardDoneBar();

  const save = () => {
    const value = draft.trim();
    if (!value) return;
    onSave(value);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View accessibilityViewIsModal style={styles.sheet}>
          <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.label}>
            Other
          </AppText>
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            placeholder="Knee"
            placeholderTextColor={colors.textSubtle}
            style={[inputStyles.input, styles.field]}
            accessibilityLabel="Other pain location"
            inputAccessoryViewID={doneBar.id}
          />
          {/* Rendered inside the popup so iOS finds it alongside the field. */}
          {doneBar.bar}

          {previousLocations.length > 0 ? (
            <>
              <AppText variant="bodySmall" color="onSurfaceVariant" style={styles.label}>
                Previously entered locations
              </AppText>
              <View style={styles.previous}>
                {previousLocations.map((location) => (
                  <Pressable
                    key={location}
                    onPress={() => setDraft(location)}
                    accessibilityRole="button"
                    accessibilityLabel={`Use ${location}`}
                    style={styles.previousLocation}>
                    <AppText variant="bodyLarge" color="onSecondaryContainer">
                      {location}
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.actions}>
            <Button label="Cancel" variant="tonal" onPress={onCancel} />
            <Button label="Ok" variant="primary" onPress={save} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const useStyles = makeStyles((colors) => ({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
    backgroundColor: colors.backdrop,
  },
  // Like the Settings pop-ups: a plain sheet with lavender fields on it.
  sheet: {
    width: '100%',
    maxWidth: 400,
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
  },
  field: {
    backgroundColor: colors.surfaceContainer,
  },
  label: {
    marginLeft: Spacing.one,
  },
  previous: {
    gap: Spacing.two,
  },
  previousLocation: {
    minHeight: MinTapTarget,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.control,
    backgroundColor: colors.secondaryContainer,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
}));
