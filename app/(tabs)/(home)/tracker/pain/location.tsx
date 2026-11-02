import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { OTHER_LOCATION_LABEL, PAIN_LOCATION_PRESETS } from '@/constants/painLocations';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Modal, Pressable, Text, TextInput, View } from 'react-native';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
const PRESET_OPTIONS = PAIN_LOCATION_PRESETS;
const PREVIOUS_LOCATIONS = ['Outer thigh', 'Inner thigh'];

export default function PainLocationScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
  const { answers, updateAnswer } = usePainAssessment();
  const savedLocations = answers.painLocations ?? [];
  const [selectedPresets, setSelectedPresets] = useState<number[]>(() =>
    PRESET_OPTIONS.reduce<number[]>((indices, option, index) => {
      if (savedLocations.includes(option)) {
        indices.push(index);
      }
      return indices;
    }, []),
  );
  // Custom "Other" entries: each becomes its own selected option above the final "Other" row.
  const [customLocations, setCustomLocations] = useState<string[]>(() =>
    savedLocations.filter(location => !PRESET_OPTIONS.includes(location as never)),
  );
  const [isOtherModalVisible, setIsOtherModalVisible] = useState(false);
  const [draftOtherLocation, setDraftOtherLocation] = useState('');
  const doneBar = useKeyboardDoneBar();

  const otherIndex = PRESET_OPTIONS.length + customLocations.length;
  const displayOptions: string[] = [...PRESET_OPTIONS, ...customLocations, OTHER_LOCATION_LABEL];
  const customIndices = customLocations.map((_, i) => PRESET_OPTIONS.length + i);
  // "Other" is an action row and is never shown as checked.
  const selected = [...selectedPresets, ...customIndices];

  const handleSelectionChange = (nextSelected: number[]) => {
    setSelectedPresets(nextSelected.filter(index => index < PRESET_OPTIONS.length));
    setCustomLocations(current =>
      current.filter((_, i) => nextSelected.includes(PRESET_OPTIONS.length + i)),
    );
  };

  const handleOptionPress = (index: number) => {
    if (index !== otherIndex) {
      return;
    }

    setDraftOtherLocation('');
    setIsOtherModalVisible(true);
    return true;
  };

  const saveSelection = () => {
    updateAnswer('painLocations', [
      ...selectedPresets.map(index => PRESET_OPTIONS[index]),
      ...customLocations,
    ]);
  };

  const handleRecord = () => {
    if (selected.length === 0) {
      return;
    }

    saveSelection();
    router.push('/tracker/pain/characteristics');
  };

  const handlePrevious = () => {
    saveSelection();
    router.back();
  };

  return (
    // Tapping anywhere outside a text box closes the keyboard. Not exposed to screen readers.
    <Pressable onPress={Keyboard.dismiss} accessible={false} style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>My Pain</Text>
      <MultiChoiceList
        title="Pain location"
        prompt="I have had pain in these areas last week."
        subPrompt="Select ALL relevant statements. If none applies, press &quot;Next&quot;"
        options={displayOptions}
        selectedIndices={selected}
        onSelectionChange={handleSelectionChange}
        onOptionPress={handleOptionPress}
        questionNumber={1}
        totalQuestions={6}
        onRecord={handleRecord}
        onPrevious={handlePrevious}
        disabled={selected.length === 0}
        variant="painTracker"
        scrollable
      />
      </View>

      <Modal visible={isOtherModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Other</Text>
            <TextInput
              autoFocus
              value={draftOtherLocation}
              onChangeText={setDraftOtherLocation}
              placeholder="Knee"
              placeholderTextColor={colors.text}
              style={styles.input}
              accessibilityLabel="Other pain location"
              inputAccessoryViewID={doneBar.id}
            />
            {/* Rendered inside the popup so iOS finds it alongside the field. */}
            {doneBar.bar}
            <Text style={styles.previousLabel}>Previously entered locations</Text>
            <View style={styles.previousLocations}>
              {PREVIOUS_LOCATIONS.map(location => (
                <Pressable
                  key={location}
                  onPress={() => setDraftOtherLocation(location)}
                  accessibilityRole="button"
                  accessibilityLabel={`Use ${location}`}
                  style={styles.previousLocation}
                >
                  <Text style={styles.previousLocationText}>{location}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setIsOtherModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const value = draftOtherLocation.trim();
                  if (!value) {
                    return;
                  }
                  setCustomLocations(current =>
                    current.includes(value) || PRESET_OPTIONS.includes(value as never)
                      ? current
                      : [...current, value],
                  );
                  setIsOtherModalVisible(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Ok"
                style={styles.okButton}
              >
                <Text style={styles.okButtonText}>Ok</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  pageTitle: {
    ...Typography.title,
    color: colors.text,
    marginLeft: Spacing.two,
    marginBottom: Spacing.three,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backdrop,
    padding: Spacing.four,
  },
  modalContent: {
    width: '100%',
    maxWidth: 386,
    height: 242,
    borderRadius: Radius.card,
    backgroundColor: colors.surface,
    paddingTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.two,
  },
  modalLabel: {
    color: colors.textSecondary,
    ...Typography.caption,
    fontWeight: '400',
    marginLeft: Spacing.three,
  },
  input: {
    height: 40,
    backgroundColor: colors.surfaceContainer,
    borderRadius: 2,
    paddingHorizontal: Spacing.one,
    paddingVertical: 0,
    color: colors.text,
    ...Typography.bodyLarge,
  },
  previousLabel: {
    color: colors.textSecondary,
    ...Typography.caption,
    marginTop: Spacing.two,
    marginLeft: Spacing.three,
  },
  previousLocations: {
    gap: Spacing.two,
    marginTop: Spacing.half,
  },
  previousLocation: {
    height: 30,
    justifyContent: 'center',
    backgroundColor: colors.secondaryContainer,
    borderRadius: 2,
    paddingHorizontal: Spacing.one,
  },
  previousLocationText: {
    color: colors.text,
    ...Typography.bodyLarge,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: 'auto',
    paddingHorizontal: Spacing.two,
  },
  cancelButton: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  cancelButtonText: {
    color: colors.primary,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  okButton: {
    width: 105,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.outline,
    borderRadius: Radius.control,
    backgroundColor: colors.primary,
    paddingVertical: Spacing.three,
    minHeight: MinTapTarget,
  },
  okButtonText: {
    color: colors.onPrimary,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
}));