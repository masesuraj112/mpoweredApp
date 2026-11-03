import { useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { makeStyles, MinTapTarget, Radius, Spacing } from '@/constants/theme';

import { CheckboxOptionRow } from '@/components/ui/CheckboxOptionRow';
import { ChoiceCard, type ChoiceCardVariant } from './ChoiceCard';
import { ChoiceOptionList } from './ChoiceOptionList';
import { QuestionHint, QuestionPrompt } from './ChoicePrompt';
import { SearchBar } from '@/components/ui/SearchBar';

type MultiChoiceListProps = {
  /** Screen heading, e.g. "Pain location" */
  title: string;
  /** Bold instruction line, e.g. "I have had pain in these areas last week." */
  prompt: ReactNode;
  /** Optional italic sub-line under the prompt, e.g. "(scroll down for more options)" */
  subPrompt?: string;
  options: string[];
  supportingTexts?: (string | undefined)[];
  /** Pass to control selection from the parent (e.g. restoring a saved answer). Omit to let the component manage its own state. */
  selectedIndices?: number[];
  onSelectionChange?: (selectedIndices: number[]) => void;
  /** Return true to say the press was handled, so the option is not toggled. */
  onOptionPress?: (index: number, selectedIndices: number[]) => boolean | void;
  questionNumber?: number;
  totalQuestions?: number;
  onRecord?: () => void;
  onPrevious?: () => void;
  validationMessage?: string;
  disabled?: boolean;
  variant?: ChoiceCardVariant;
  /** Show a search box above the options. On by default for the pain tracker. */
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  /** Show the chosen options as removable chips. On by default for the pain tracker. */
  selectedChipsEnabled?: boolean;
};

/** A pick-any question: a card with a list of checkbox options. */
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
  validationMessage,
  disabled = false,
  variant = 'personalCare',
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

    const next = selected.includes(index)
      ? selected.filter((i) => i !== index)
      : [...selected, index];

    if (!isControlled) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
  };

  // The question, then its sub-line, styled like every other question.
  const fullPrompt = subPrompt ? (
    <>
      {typeof prompt === 'string' ? <QuestionPrompt>{prompt}</QuestionPrompt> : prompt}
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
      validationMessage={validationMessage}
      disabled={disabled}
      variant={variant}>
      {showSearch ? (
        <SearchBar value={searchText} onChangeText={setSearchText} placeholder={searchPlaceholder} />
      ) : null}
      {showSelectedChips && selected.length > 0 ? (
        <View style={styles.chips}>
          {selected.map((index) => (
            <Pressable
              key={index}
              onPress={() => onSelectionChange?.(selected.filter((selectedIndex) => selectedIndex !== index))}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${options[index]}`}
              style={styles.chip}>
              <AppText variant="labelLarge" color="onSecondaryContainer">
                {options[index]}
              </AppText>
              <AppText accessibilityElementsHidden importantForAccessibility="no" variant="subtitle" color="onSecondaryContainer">
                ×
              </AppText>
            </Pressable>
          ))}
        </View>
      ) : null}
      <ChoiceOptionList testID="multi-choice-options">
        {filteredOptions.map(({ option, originalIndex }, index) => (
          <CheckboxOptionRow
            key={originalIndex}
            label={option}
            supportingText={supportingTexts?.[originalIndex]}
            selected={selected.includes(originalIndex)}
            isLast={index === filteredOptions.length - 1}
            onPress={() => toggle(originalIndex)}
          />
        ))}
      </ChoiceOptionList>
    </ChoiceCard>
  );
}

const useStyles = makeStyles((colors) => ({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  // A solid fill, like the app's other selected chips.
  chip: {
    minHeight: MinTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: colors.secondaryContainer,
  },
}));
