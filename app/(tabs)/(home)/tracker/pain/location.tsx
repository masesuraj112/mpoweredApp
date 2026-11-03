import { MultiChoiceList } from '@/components/tracker/MultiChoiceList';
import { OtherLocationModal } from '@/components/tracker/OtherLocationModal';
import { TrackerQuestionScreen } from '@/components/tracker/TrackerQuestionScreen';
import { OTHER_LOCATION_LABEL, PAIN_LOCATION_PRESETS } from '@/constants/painLocations';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { router } from 'expo-router';
import { useState } from 'react';

const PRESET_OPTIONS = PAIN_LOCATION_PRESETS;
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

  return (
    <TrackerQuestionScreen title="My Pain">
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
        disabled={selected.length === 0}
        variant="painTracker"
      />

      {isOtherModalVisible ? (
        <OtherLocationModal
          previousLocations={PREVIOUS_LOCATIONS}
          onCancel={() => setIsOtherModalVisible(false)}
          onSave={value => {
            setCustomLocations(current =>
              current.includes(value) || PRESET_OPTIONS.includes(value as never)
                ? current
                : [...current, value],
            );
            setIsOtherModalVisible(false);
          }}
        />
      ) : null}
    </TrackerQuestionScreen>
  );
}
