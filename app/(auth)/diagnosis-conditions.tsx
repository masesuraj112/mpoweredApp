import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const selectedConditions = data.conditions.filter((condition) => CONDITIONS.includes(condition));
  const [selectedChipsContentHeight, setSelectedChipsContentHeight] = useState(0);
  const buttonBottom = Math.max(64 * scale, insets.bottom + 12 * scale);
  const buttonTop = canvasHeight - buttonBottom - 52 * scale;
  const maxSelectedChipsHeight = Math.max(41 * scale, buttonTop - 258 * scale - 28 * scale - 120 * scale - 28 * scale);
  const selectedChipsHeight = Math.min(selectedChipsContentHeight, maxSelectedChipsHeight);
  const conditionsTop = Math.max(330 * scale, 258 * scale + selectedChipsHeight + 28 * scale);
  const conditionsHeight = Math.max(120 * scale, buttonTop - conditionsTop - 28 * scale);

  const handleContinue = () => router.push('/(auth)/other-conditions');

  const toggleCondition = (condition: string) => {
    const nextConditions = selectedConditions.includes(condition)
      ? selectedConditions.filter((selected) => selected !== condition)
      : [...selectedConditions, condition];
    updateData({ conditions: nextConditions });
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

        <ScrollView
          showsVerticalScrollIndicator={false}
          scrollEnabled={selectedChipsContentHeight > maxSelectedChipsHeight}
          onContentSizeChange={(_, contentHeight) => setSelectedChipsContentHeight(contentHeight)}
          style={[styles.selectedScroller, { top: 258 * scale, left: 33 * scale, width: 346 * scale, height: selectedChipsHeight }]}
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
          {CONDITIONS.map((condition) => {
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