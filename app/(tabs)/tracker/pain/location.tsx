import { MultiChoiceList } from '@/components/mpowered/MultiChoiceList';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { router } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export const PAIN_LOCATION_OPTIONS = [
  'Head',
  'Neck',
  'Shoulder',
  'Upper Back',
  'Lower Back',
  'Leg',
  'Hip',
  'Buttock',
  'Knee',
  'Other',
] as const;

const PRESET_OPTIONS = PAIN_LOCATION_OPTIONS.slice(0, -1);
const PREVIOUS_LOCATIONS = ['Outer thigh', 'Inner thigh'];

export default function PainLocationScreen() {
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

  const otherIndex = PRESET_OPTIONS.length + customLocations.length;
  const displayOptions: string[] = [...PRESET_OPTIONS, ...customLocations, 'Other'];
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
    <View style={styles.screen}>
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
              placeholderTextColor="#1D1B20"
              style={styles.input}
              accessibilityLabel="Other pain location"
            />
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: scaleWidth(22),
    paddingTop: scaleHeight(16),
  },
  pageTitle: {
    fontSize: scaleFont(24),
    fontWeight: '600',
    color: '#000000',
    marginLeft: scaleWidth(9),
    marginBottom: scaleHeight(18),
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: scaleWidth(24),
  },
  modalContent: {
    width: '100%',
    maxWidth: scaleWidth(386),
    height: scaleHeight(242),
    borderRadius: scaleWidth(12),
    backgroundColor: '#FFFFFF',
    paddingTop: scaleHeight(12),
    paddingHorizontal: scaleWidth(16),
    paddingBottom: scaleHeight(8),
  },
  modalLabel: {
    color: '#49454F',
    fontSize: scaleFont(12),
    fontWeight: '400',
    lineHeight: scaleHeight(16),
    marginLeft: scaleWidth(16),
  },
  input: {
    height: scaleHeight(40),
    backgroundColor: '#E6E0E9',
    borderRadius: scaleWidth(2),
    paddingHorizontal: scaleWidth(4),
    paddingVertical: 0,
    color: '#1D1B20',
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
  previousLabel: {
    color: '#49454F',
    fontSize: scaleFont(12),
    lineHeight: scaleHeight(16),
    marginTop: scaleHeight(8),
    marginLeft: scaleWidth(16),
  },
  previousLocations: {
    gap: scaleHeight(7),
    marginTop: scaleHeight(2),
  },
  previousLocation: {
    height: scaleHeight(30),
    justifyContent: 'center',
    backgroundColor: '#CCC2DC',
    borderRadius: scaleWidth(2),
    paddingHorizontal: scaleWidth(4),
  },
  previousLocationText: {
    color: '#1D1B20',
    fontSize: scaleFont(16),
    lineHeight: scaleHeight(24),
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: scaleWidth(8),
    marginTop: 'auto',
    paddingHorizontal: scaleWidth(8),
  },
  cancelButton: {
    height: scaleHeight(48),
    justifyContent: 'center',
    paddingHorizontal: scaleWidth(16),
  },
  cancelButtonText: {
    color: '#6750A4',
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  okButton: {
    width: scaleWidth(105),
    height: scaleHeight(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CAC4D0',
    borderRadius: scaleWidth(16),
    backgroundColor: '#6750A4',
  },
  okButtonText: {
    color: '#FEF7FF',
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
});