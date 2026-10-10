import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SearchBar } from '@/components/mpowered/SearchBar';

const CONDITIONS = [
  'Arthritis',
  'Ankylosing spondylitis',
  'Back pain',
  'Baker’s cyst',
  'Bursitis',
  'Foot related conditions',
  'Fibromyalgia',
  'Gout',
  'Juvenile idiopathic arthritis',
  'Hand conditions',
  'Lupus',
  'Neck pain',
  'Osteoarthritis',
  'Osteoporosis',
  "Paget's disease",
  "Perthes' disease",
  'Polymyalgia rheumatica',
  'Psoriatic arthritis',
  'Raynaud’s phenomenon',
  'Reactive arthritis',
  'Rheumatoid arthritis',
  'Scleroderma',
  'Shoulder pain',
  'Sjogren’s syndrome',
];

const CONDITION_LABELS: Record<string, string> = {
  "Paget's disease": 'Paget’s disease',
  "Perthes' disease": 'Perthes’ disease',
  'Sjogren’s syndrome': 'Sjogren’s disease',
};

export default function DiagnosisConditionsScreen() {
  const { data, updateData } = useOnboarding();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(1, width / 412, height / 823);
  const canvasWidth = 412 * scale;
  const canvasHeight = 823 * scale;
  const selectedConditions = data.conditions;
  const [searchText, setSearchText] = useState('');
  const [isAddingCustomCondition, setIsAddingCustomCondition] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const [selectedChipsContentHeight, setSelectedChipsContentHeight] = useState(0);
  const buttonBottom = Math.max(64 * scale, insets.bottom + 12 * scale);
  const buttonTop = canvasHeight - buttonBottom - 52 * scale;
  const maxSelectedChipsHeight = Math.max(41 * scale, buttonTop - 286 * scale - 20 * scale - 120 * scale - 20 * scale);
  const selectedChipsHeight = Math.min(selectedChipsContentHeight, maxSelectedChipsHeight);
  const conditionsTop = Math.max(330 * scale, 286 * scale + selectedChipsHeight + 20 * scale);
  const conditionsHeight = Math.max(120 * scale, buttonTop - conditionsTop - 20 * scale);
  const filteredConditions = CONDITIONS.filter((condition) =>
    (CONDITION_LABELS[condition] ?? condition).toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  const handleContinue = () => router.push('/(auth)/other-conditions');

  const toggleCondition = (condition: string) => {
    const nextConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter((selected) => selected !== condition)
      : [...selectedConditions, condition];
    updateData({ conditions: nextConditions });
  };

  const addCustomCondition = () => {
    const trimmedCondition = customCondition.trim();
    if (!trimmedCondition) return;
    const alreadySelected = selectedConditions.some(
      (condition) => condition.toLocaleLowerCase() === trimmedCondition.toLocaleLowerCase(),
    );
    if (!alreadySelected) updateData({ conditions: [...selectedConditions, trimmedCondition] });
    setCustomCondition('');
    setSearchText('');
    setIsAddingCustomCondition(false);
  };

  const removeCondition = (condition: string) => {
    updateData({ conditions: selectedConditions.filter((selected) => selected !== condition) });
  };

  const hasSelection = selectedConditions.length > 0;

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.canvas,
          {
            width: canvasWidth,
            height: canvasHeight,
            left: (width - canvasWidth) / 2,
            top: (height - canvasHeight) / 2,
          },
        ]}
      >
        <Text style={[styles.title, { top: 110 * scale, left: 53 * scale, width: 300 * scale, fontSize: 22 * scale, lineHeight: 28 * scale }]}>
          Tell us about the musculoskeletal or chronic pain you’re experiencing
        </Text>

        <Text style={[styles.prompt, { top: 209 * scale, left: 53 * scale, width: 300 * scale, fontSize: 14 * scale, lineHeight: 20 * scale }]}>
          You can select multiple conditions
        </Text>

        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search diagnoses"
          style={[
            styles.searchInput,
            {
              top: 240 * scale,
              left: 62 * scale,
              width: 280 * scale,
              height: 36 * scale,
              borderRadius: 4 * scale,
              paddingHorizontal: 12 * scale,
              fontSize: 14 * scale,
            },
          ]}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={selectedChipsContentHeight > maxSelectedChipsHeight}
          onContentSizeChange={(_, contentHeight) => setSelectedChipsContentHeight(contentHeight)}
          style={[styles.selectedScroller, { top: 286 * scale, left: 33 * scale, width: 346 * scale, height: selectedChipsHeight }]}
          contentContainerStyle={[styles.selectedChips, { width: 346 * scale, gap: 12 * scale }]}
        >
          {selectedConditions.map((condition) => (
            <View key={condition} style={[styles.chip, { height: 41 * scale, borderRadius: 21 * scale, paddingLeft: 16 * scale, paddingRight: 10 * scale, gap: 10 * scale }]}>
              <Text style={[styles.chipLabel, { fontSize: 12 * scale }]} numberOfLines={1}>
                {CONDITION_LABELS[condition] ?? condition}
              </Text>
              <Pressable
                onPress={() => removeCondition(condition)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${condition}`}
                hitSlop={6}
              >
                <Text style={[styles.chipRemove, { fontSize: 19 * scale, lineHeight: 20 * scale }]}>×</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <ScrollView
          style={[styles.conditionsPanel, { top: conditionsTop, left: 62 * scale, width: 280 * scale, height: conditionsHeight, borderRadius: 4 * scale }]}
          contentContainerStyle={styles.conditionsContent}
          showsVerticalScrollIndicator
          indicatorStyle="black"
        >
          {filteredConditions.map((condition) => {
            const selected = selectedConditions.includes(condition);
            return (
              <Pressable
                key={condition}
                onPress={() => toggleCondition(condition)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={CONDITION_LABELS[condition] ?? condition}
                style={[styles.conditionRow, { height: 56 * scale, paddingHorizontal: 12 * scale, gap: 12 * scale }]}
              >
                <Text style={[styles.conditionLabel, { fontSize: 14 * scale, lineHeight: 20 * scale }]} numberOfLines={1}>
                  {CONDITION_LABELS[condition] ?? condition}
                </Text>
                <View style={[styles.checkbox, { width: 18 * scale, height: 18 * scale, borderRadius: 2 * scale, borderWidth: 2 * scale }, selected && styles.checkboxSelected]}>
                  {selected && <Text style={[styles.checkmark, { fontSize: 13 * scale, lineHeight: 14 * scale }]}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
          <View style={[styles.customConditionRow, { minHeight: 56 * scale, paddingHorizontal: 12 * scale, gap: 8 * scale }]}>
            {isAddingCustomCondition ? (
              <>
                <TextInput
                  accessibilityLabel="Custom diagnosis"
                  autoFocus
                  value={customCondition}
                  onChangeText={setCustomCondition}
                  onSubmitEditing={addCustomCondition}
                  placeholder="Enter a diagnosis"
                  returnKeyType="done"
                  style={[styles.customConditionInput, { fontSize: 14 * scale, height: 40 * scale }]}
                />
                <Pressable
                  accessibilityRole="button"
                  disabled={!customCondition.trim()}
                  onPress={addCustomCondition}
                  style={[styles.addCustomButton, !customCondition.trim() && styles.addCustomButtonDisabled]}
                >
                  <Text style={[styles.addCustomButtonText, { fontSize: 13 * scale }]}>Add</Text>
                </Pressable>
              </>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setCustomCondition(searchText.trim());
                  setIsAddingCustomCondition(true);
                }}
                style={styles.addCustomOption}
              >
                <Text style={[styles.addCustomOptionText, { fontSize: 14 * scale, lineHeight: 20 * scale }]}>
                  Other – add custom diagnosis
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>

        <Pressable
          disabled={!hasSelection}
          style={[
            styles.continueButton,
            { left: 52 * scale, bottom: buttonBottom, width: 306 * scale, height: 52 * scale, borderRadius: 16 * scale },
            !hasSelection && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
        >
          <Text style={[styles.continueText, { fontSize: 14 * scale }, !hasSelection && styles.continueTextDisabled]}>Continue</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  canvas: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  title: {
    position: 'absolute',
    textAlign: 'center',
    color: '#1D1B20',
    fontWeight: '500',
  },
  prompt: {
    position: 'absolute',
    textAlign: 'center',
    color: '#1D1B20',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  selectedScroller: {
    position: 'absolute',
    overflow: 'visible',
  },
  searchInput: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderColor: '#CAC4D0',
    textAlign: 'left',
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3EDF7',
    maxWidth: 220,
  },
  chipLabel: {
    color: '#1D1B20',
    fontWeight: '500',
  },
  chipRemove: {
    color: '#1D1B20',
  },
  conditionsPanel: {
    position: 'absolute',
    backgroundColor: '#F3EDF7',
    overflow: 'hidden',
    elevation: 2,
  },
  conditionsContent: {
    paddingBottom: 4,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  conditionLabel: {
    flex: 1,
    color: '#1D1B20',
    fontWeight: '400',
  },
  customConditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addCustomOption: {
    flex: 1,
    justifyContent: 'center',
  },
  addCustomOptionText: {
    color: '#6750A4',
    fontWeight: '600',
  },
  customConditionInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#79747E',
    borderRadius: 4,
    paddingHorizontal: 8,
    color: '#1D1B20',
  },
  addCustomButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    backgroundColor: '#6750A4',
  },
  addCustomButtonDisabled: {
    backgroundColor: '#D9D0EE',
  },
  addCustomButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#49454F',
  },
  checkboxSelected: {
    backgroundColor: '#6750A4',
    borderColor: '#6750A4',
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  continueButton: {
    position: 'absolute',
    backgroundColor: '#6750A4',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#D9D0EE',
  },
  continueText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  continueTextDisabled: {
    color: '#5B4A9E',
  },
});