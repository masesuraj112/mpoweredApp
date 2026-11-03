import { useOnboarding } from '@/context/Onboarding-Context';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { AuthScreen } from '@/components/auth/AuthScreen';
import { useAuthStyles } from '@/components/auth/authStyles';
import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { SearchBar } from '@/components/tracker/SearchBar';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { makeStyles, MinTapTarget, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';

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
  const styles = useStyles();
  const auth = useAuthStyles();
  const colors = useThemeColors();
  const { data, updateData } = useOnboarding();
  const selectedConditions = data.conditions;
  const [searchText, setSearchText] = useState('');
  const [isAddingCustomCondition, setIsAddingCustomCondition] = useState(false);
  const [customCondition, setCustomCondition] = useState('');
  const doneBar = useKeyboardDoneBar();
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
    <AuthScreen
      footer={<Button label="Continue" variant="primary" disabled={!hasSelection} onPress={handleContinue} />}>
      <Text accessibilityRole="header" style={auth.title}>
        Tell us about the musculoskeletal or chronic pain you’re experiencing
      </Text>
      <Text style={auth.lead}>You can select multiple conditions</Text>

      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search diagnoses" style={auth.input} />

      {hasSelection && (
        <View style={styles.selectedChips}>
          {selectedConditions.map((condition) => (
            <View key={condition} style={styles.chip}>
              <Text style={styles.chipLabel} numberOfLines={1}>
                {CONDITION_LABELS[condition] ?? condition}
              </Text>
              <Pressable
                onPress={() => removeCondition(condition)}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${condition}`}
                style={styles.chipRemove}>
                <Text style={styles.chipRemoveText}>×</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      <View style={styles.conditionsList}>
        {filteredConditions.map((condition, index) => (
          <Checkbox
            key={condition}
            checked={selectedConditions.includes(condition)}
            onChange={() => toggleCondition(condition)}
            label={CONDITION_LABELS[condition] ?? condition}
            style={[styles.conditionRow, index > 0 && styles.rowDivider]}
          />
        ))}
        <View style={[styles.customConditionRow, filteredConditions.length > 0 && styles.rowDivider]}>
          {isAddingCustomCondition ? (
            <>
              <TextInput
                accessibilityLabel="Custom diagnosis"
                autoFocus
                value={customCondition}
                onChangeText={setCustomCondition}
                onSubmitEditing={addCustomCondition}
                placeholder="Enter a diagnosis"
                placeholderTextColor={colors.textSubtle}
                returnKeyType="done"
                inputAccessoryViewID={doneBar.id}
                style={[auth.input, styles.customConditionInput]}
              />
              <Button label="Add" variant="primary" disabled={!customCondition.trim()} onPress={addCustomCondition} />
            </>
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setCustomCondition(searchText.trim());
                setIsAddingCustomCondition(true);
              }}
              style={styles.addCustomOption}>
              <Text style={styles.addCustomOptionText}>Other – add custom diagnosis</Text>
            </Pressable>
          )}
        </View>
      </View>
      {doneBar.bar}
    </AuthScreen>
  );
}

const useStyles = makeStyles((colors) => ({
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    paddingLeft: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: colors.secondaryContainer,
  },
  chipLabel: {
    flexShrink: 1,
    ...Typography.labelLarge,
    color: colors.onSecondaryContainer,
  },
  chipRemove: {
    width: MinTapTarget,
    height: MinTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRemoveText: {
    ...Typography.subtitle,
    color: colors.onSecondaryContainer,
  },
  conditionsList: {
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.card,
    backgroundColor: colors.surfaceContainer,
  },
  conditionRow: {
    paddingVertical: Spacing.two,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  customConditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    minHeight: MinTapTarget + Spacing.two,
  },
  addCustomOption: {
    flex: 1,
    minHeight: MinTapTarget,
    justifyContent: 'center',
  },
  addCustomOptionText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.primary,
  },
  customConditionInput: {
    flex: 1,
  },
}));
