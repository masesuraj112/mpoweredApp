import { ReactNode, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChoiceCard, QuestionHint } from './ChoiceCard';
import { ChoiceList, ChoiceRow } from './ChoiceRow';
import { SearchBar } from './SearchBar';

import { makeStyles, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

interface MultiChoiceListProps {
  /** Card heading, e.g. "Pain location" */
  title: string;
  /** The question: a string, or `QuestionPrompt` / `QuestionHint` elements. */
  prompt: ReactNode;
  /** A secondary line under the question, e.g. "(scroll down for more options)" */
  subPrompt?: string;
  options: string[];
  supportingTexts?: (string | undefined)[];
  /** Pass to control selection from the parent (e.g. restoring a saved answer). Omit to let the component manage its own state. */
  selectedIndices?: number[];
  onSelectionChange?: (selectedIndices: number[]) => void;
  onOptionPress?: (index: number, selectedIndices: number[]) => boolean | void;
  questionNumber?: number;
  totalQuestions?: number;
  onRecord?: () => void;
  onPrevious?: () => void;
  previousDisabled?: boolean;
  validationMessage?: string;
  disabled?: boolean;
  variant?: 'default' | 'painTracker' | 'personalCare' | 'management';
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  selectedChipsEnabled?: boolean;
}

/** A pick-any question: its options as checkbox rows, with an optional search and chips for what is picked. */
export function MultiChoiceList({
  title,
  prompt,
  subPrompt,
  options,
  supportingTexts,
  selectedIndices,
  onSelectionChange,
  onOptionPress,
  questionNumber,
  totalQuestions,
  onRecord,
  onPrevious,
  previousDisabled = false,
  validationMessage,
  disabled = false,
  variant = 'default',
  searchEnabled,
  searchPlaceholder = 'Search',
  selectedChipsEnabled,
}: MultiChoiceListProps) {
  const styles = useStyles();
  const [internalSelected, setInternalSelected] = useState<number[]>([]);
  const isControlled = selectedIndices !== undefined;
  const selected = isControlled ? selectedIndices : internalSelected;
  const [searchText, setSearchText] = useState('');
  const showSearch = searchEnabled ?? variant === 'painTracker';
  const showSelectedChips = selectedChipsEnabled ?? variant === 'painTracker';
  const filteredOptions = options
    .map((option, originalIndex) => ({ option, originalIndex }))
    .filter(({ option }) => option.toLowerCase().includes(searchText.trim().toLowerCase()));

  const toggle = (index: number) => {
    if (onOptionPress?.(index, selected) === true) {
      return;
    }

    const next = selected.includes(index) ? selected.filter((i) => i !== index) : [...selected, index];

    if (!isControlled) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
  };

  const fullPrompt = subPrompt ? (
    <>
      {typeof prompt === 'string' ? <Text style={styles.promptText}>{prompt}</Text> : prompt}
      <QuestionHint>{subPrompt}</QuestionHint>
    </>
  ) : (
    prompt
  );

  return (
    <ChoiceCard
      title={title}
      prompt={fullPrompt}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onRecord={onRecord}
      onPrevious={onPrevious}
      previousDisabled={previousDisabled}
      validationMessage={validationMessage}
      disabled={disabled}
      variant={variant}>
      {showSearch && <SearchBar value={searchText} onChangeText={setSearchText} placeholder={searchPlaceholder} />}
      {showSelectedChips && selected.length > 0 && (
        <View style={styles.selectedChips}>
          {selected.map((index) => (
            <Pressable
              key={index}
              onPress={() => onSelectionChange?.(selected.filter((selectedIndex) => selectedIndex !== index))}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${options[index]}`}
              style={styles.selectedChip}>
              <Text style={styles.selectedChipText}>{options[index]}</Text>
              <Text style={styles.selectedChipClose}>×</Text>
            </Pressable>
          ))}
        </View>
      )}
      <ChoiceList testID="multi-choice-options">
        {filteredOptions.map(({ option, originalIndex }, index) => (
          <ChoiceRow
            key={originalIndex}
            kind="checkbox"
            label={option}
            supportingText={supportingTexts?.[originalIndex]}
            selected={selected.includes(originalIndex)}
            onPress={() => toggle(originalIndex)}
            isLast={index === filteredOptions.length - 1}
          />
        ))}
      </ChoiceList>
    </ChoiceCard>
  );
}

const useStyles = makeStyles((colors) => ({
  // Matches QuestionPrompt, for a plain-string prompt shown with a sub-line.
  promptText: {
    ...Typography.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  selectedChip: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: colors.secondaryContainer,
  },
  selectedChipText: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.onSecondaryContainer,
  },
  selectedChipClose: {
    ...Typography.subtitle,
    color: colors.onSecondaryContainer,
  },
}));
