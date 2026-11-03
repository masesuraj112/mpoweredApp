import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View, type ScrollViewInstance } from 'react-native';

import { AuthButton } from '@/components/auth/AuthButton';
import { AuthInput } from '@/components/auth/AuthInput';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { AuthTitle } from '@/components/auth/AuthTitle';
import { AppText } from '@/components/ui/AppText';
import { CheckboxOptionRow } from '@/components/ui/CheckboxOptionRow';
import { ChipButton } from '@/components/ui/ChipButton';
import { useKeyboardDoneBar } from '@/components/ui/KeyboardDoneBar';
import { SearchBar } from '@/components/ui/SearchBar';
import { makeStyles, MinTapTarget, Radius, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/Onboarding-Context';

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

// The selected conditions grow in rows of chips; past this height they scroll, so the list below keeps its room.
const CHIPS_MAX_HEIGHT = 150;

const labelOf = (condition: string) => CONDITION_LABELS[condition] ?? condition;

export default function DiagnosisConditionsScreen() {
  const styles = useStyles();
  const { data, updateData } = useOnboarding();
  const selectedConditions = data.conditions;
  const [searchText, setSearchText] = useState('');
  const [isAddingCustomCondition, setIsAddingCustomCondition] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const doneBar = useKeyboardDoneBar();
  const selectedChipsRef = useRef<ScrollViewInstance>(null);
  const [selectedChipsContentHeight, setSelectedChipsContentHeight] = useState(0);
  const filteredConditions = CONDITIONS.filter((condition) =>
    labelOf(condition).toLowerCase().includes(searchText.trim().toLowerCase()),
  );

  // Once the chips outgrow their space they scroll, so bring the newest one into view.
  useEffect(() => {
    if (selectedChipsContentHeight > CHIPS_MAX_HEIGHT) {
      selectedChipsRef.current?.scrollToEnd({ animated: true });
    } else {
      selectedChipsRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [selectedConditions.length, selectedChipsContentHeight]);

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
    <AuthScreen
      scroll={false}
      footer={<AuthButton label="Continue" disabled={!hasSelection} onPress={handleContinue} />}
    >
      <AuthTitle>Tell us about the musculoskeletal or chronic pain you’re experiencing</AuthTitle>

      <AppText variant="labelLarge" style={styles.prompt}>
        You can select multiple conditions
      </AppText>

      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search diagnoses" />

      {hasSelection && (
        <ScrollView
          ref={selectedChipsRef}
          showsVerticalScrollIndicator={false}
          scrollEnabled={selectedChipsContentHeight > CHIPS_MAX_HEIGHT}
          onContentSizeChange={(_, contentHeight) => setSelectedChipsContentHeight(contentHeight)}
          // Keep ScrollView's default overflow: any other value limits the chips to this view's height, which starts
          // at 0, so their height measures 0 and the view never grows.
          style={styles.selectedScroller}
          contentContainerStyle={styles.selectedChips}
        >
          {selectedConditions.map((condition) => (
            <View key={condition} style={styles.chip}>
              <AppText variant="labelLarge" color="onSurface" numberOfLines={1} style={styles.chipLabel}>
                {labelOf(condition)}
              </AppText>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${condition}`}
                onPress={() => removeCondition(condition)}
                style={styles.chipRemove}
              >
                <AppText accessibilityElementsHidden importantForAccessibility="no" variant="titleLarge" color="onSurface">
                  ×
                </AppText>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.panel}>
        <ScrollView showsVerticalScrollIndicator keyboardShouldPersistTaps="handled" indicatorStyle="black">
          {filteredConditions.map((condition) => (
            <CheckboxOptionRow
              key={condition}
              label={labelOf(condition)}
              selected={selectedConditions.includes(condition)}
              onPress={() => toggleCondition(condition)}
            />
          ))}
          <View style={styles.customRow}>
            {isAddingCustomCondition ? (
              <>
                <AuthInput
                  accessibilityLabel="Custom diagnosis"
                  autoFocus
                  value={customCondition}
                  onChangeText={setCustomCondition}
                  onSubmitEditing={addCustomCondition}
                  placeholder="Enter a diagnosis"
                  returnKeyType="done"
                  inputAccessoryViewID={doneBar.id}
                  style={styles.customInput}
                />
                <ChipButton label="Add" disabled={!customCondition.trim()} onPress={addCustomCondition} />
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
                <AppText variant="labelLargeBold" color="primary">
                  Other – add custom diagnosis
                </AppText>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </View>
      {doneBar.bar}
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  prompt: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  selectedScroller: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: CHIPS_MAX_HEIGHT,
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    alignContent: 'flex-start',
    gap: Spacing.mid,
  },
  chip: {
    maxWidth: '100%',
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingLeft: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: colors.surfaceContainer,
  },
  chipLabel: {
    flexShrink: 1,
  },
  chipRemove: {
    minWidth: MinTapTarget,
    minHeight: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The list takes the room that is left and scrolls inside it.
  panel: {
    flex: 1,
    minHeight: 160,
    overflow: 'hidden',
    borderRadius: Radius.small,
    backgroundColor: colors.surfaceContainer,
  },
  customRow: {
    minHeight: MinTapTarget + Spacing.two,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  addCustomOption: {
    flex: 1,
    minHeight: MinTapTarget,
    justifyContent: 'center',
  },
  customInput: {
    flex: 1,
    backgroundColor: colors.background,
  },
}));
