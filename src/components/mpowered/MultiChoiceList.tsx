import { ReactNode, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChoiceCard } from './ChoiceCard';
import { SearchBar } from './SearchBar';

import { ContentColumn, makeStyles, Radius, Spacing, Typography } from '@/constants/theme';
interface MultiChoiceListProps {
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
  onOptionPress?: (index: number, selectedIndices: number[]) => boolean | void;
  questionNumber?: number;
  totalQuestions?: number;
  onRecord?: () => void;
  onPrevious?: () => void;
  previousDisabled?: boolean;
  validationMessage?: string;
  cardHeight?: number;
  disabled?: boolean;
  variant?: 'default' | 'painTracker' | 'personalCare' | 'management';
  searchEnabled?: boolean;
  searchPlaceholder?: string;
  scrollable?: boolean;
  listHeight?: number;
  selectedChipsEnabled?: boolean;
}

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
  cardHeight,
  disabled = false,
  variant = 'default',
  searchEnabled,
  searchPlaceholder = 'Search',
  scrollable,
  listHeight,
  selectedChipsEnabled,
}: MultiChoiceListProps) {
  const styles = useStyles();
  const [internalSelected, setInternalSelected] = useState<number[]>([]);
  const isControlled = selectedIndices !== undefined;
  const selected = isControlled ? selectedIndices : internalSelected;
  const [searchText, setSearchText] = useState('');
  const showSearch = searchEnabled ?? variant === 'painTracker';
  const showScrollable = scrollable ?? variant !== 'default';
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

  // ChoiceCard puts a non-string prompt straight into a View, and React Native throws on a bare
  // string there (the "\n"), so the pieces share one wrapping Text.
  const fullPrompt = subPrompt ? (
    <Text>
      <Text style={styles.promptBold}>{prompt}</Text>
      {'\n'}
      <Text style={styles.promptSub}>{subPrompt}</Text>
    </Text>
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
      cardHeight={cardHeight}
      disabled={disabled}
      variant={variant}
    >
      {showSearch && (
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder={searchPlaceholder}
          style={styles.searchInput}
        />
      )}
      {showSelectedChips && selected.length > 0 && (
        <View style={styles.selectedChips}>
          {selected.map(index => (
            <Pressable
              key={index}
              onPress={() => onSelectionChange?.(selected.filter(selectedIndex => selectedIndex !== index))}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${options[index]}`}
              style={styles.selectedChip}
            >
              <Text style={styles.selectedChipText}>{options[index]}</Text>
              <Text style={styles.selectedChipClose}>×</Text>
            </Pressable>
          ))}
        </View>
      )}
      <View
        testID="multi-choice-options"
        style={[
          styles.optionsBox,
          showScrollable && styles.scrollableOptionsBox,
          variant !== 'default' && styles.painTrackerOptionsBox,
          variant === 'personalCare' && styles.personalCareOptionsBox,
          variant === 'management' && styles.managementOptionsBox,
          variant === 'management' && listHeight !== undefined && { height: listHeight },
          variant === 'personalCare' && styles.personalCareMinHeight,
        ]}
      >
        {showScrollable ? (
          <ScrollView
            style={[
              styles.scrollList,
              listHeight !== undefined && { height: listHeight },
            ]}
            contentContainerStyle={[styles.scrollContent, styles.scrollContentGrow]}
            showsVerticalScrollIndicator={false}
            scrollEnabled
            nestedScrollEnabled
          >
            {filteredOptions.map(({ option, originalIndex }, index) => (
              <OptionRow
                key={originalIndex}
                option={option}
                supportingText={supportingTexts?.[originalIndex]}
                index={originalIndex}
                isSelected={selected.includes(originalIndex)}
                isLast={index === filteredOptions.length - 1}
                onPress={toggle}
                variant={variant}
              />
            ))}
          </ScrollView>
        ) : (
          filteredOptions.map(({ option, originalIndex }, index) => (
            <OptionRow
              key={originalIndex}
              option={option}
              supportingText={supportingTexts?.[originalIndex]}
              index={originalIndex}
              isSelected={selected.includes(originalIndex)}
              isLast={index === filteredOptions.length - 1}
              onPress={toggle}
              variant={variant}
            />
          ))
        )}
      </View>
    </ChoiceCard>
  );
}

function OptionRow({
  option,
  supportingText,
  index,
  isSelected,
  isLast,
  onPress,
  variant,
}: {
  option: string;
  supportingText?: string;
  index: number;
  isSelected: boolean;
  isLast: boolean;
  onPress: (index: number) => void;
  variant: 'default' | 'painTracker' | 'personalCare' | 'management';
}) {
  const styles = useStyles();
  const isAssessment = variant !== 'default';
  const isPersonalCare = variant === 'personalCare' || variant === 'management';
  return (
    <Pressable
      onPress={() => onPress(index)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={option}
      style={[
        styles.row,
        isAssessment && styles.painTrackerRow,
        !isLast &&
          (isPersonalCare
            ? styles.personalCareRowDivider
            : variant === 'painTracker'
              ? styles.painTrackerRowDivider
              : styles.rowDivider),
      ]}
    >
      <View style={styles.optionTextColumn}>
        <Text
          style={[
            styles.label,
            isAssessment && styles.painTrackerLabel,
            isPersonalCare && styles.personalCareLabel,
          ]}
        >
          {option}
        </Text>
        {supportingText && <Text style={styles.supportingText}>{supportingText}</Text>}
      </View>
      <View style={[styles.box, isAssessment && styles.painTrackerBox, isSelected && styles.boxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  // The prompt is passed into ChoiceCard's single promptText style, so the
  // bold/sub-line split is handled here with its own text styles instead.
  promptBold: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  promptSub: {
    ...Typography.caption,
    fontStyle: 'italic',
    fontWeight: '400',
    color: colors.textSecondary,
  },

  // Matches the screenshot: the option rows sit in their own bordered box
  // inside the card, distinct from ChoiceCard's own outer border.
  optionsBox: {
    borderRadius: Radius.card,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: colors.surfaceContainer,
  },
  scrollableOptionsBox: {
    flex: 1,
    minHeight: 0,
  },
  searchInput: {
    marginBottom: Spacing.three,
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  selectedChip: {
    minHeight: 30,
    borderRadius: Radius.pill,
    backgroundColor: colors.secondaryContainer,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
  },
  selectedChipText: {
    color: colors.textSecondary,
    ...Typography.bodySmall,
    fontWeight: '500',
  },
  selectedChipClose: {
    color: colors.textSecondary,
    ...Typography.title,
  },
  painTrackerOptionsBox: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignSelf: 'flex-start',
    borderColor: colors.divider,
    borderRadius: 5,
    backgroundColor: colors.background,
  },
  // Fixed-height box. `flex: 0` must override the `flex: 1` from the styles above: on native,
  // Yoga turns any `flex > 0` into a flex basis of 0, which beats `height` (and ignores
  // `flexBasis: 'auto'`), so with no grow the box collapses to 0 and the list is invisible.
  // Web still applies `height`, which is why the bug only shows on phones.
  personalCareOptionsBox: {
    flex: 1,
    minHeight: 0,
    width: '96%',
    marginLeft: Spacing.one,
    borderRadius: Radius.card,
  },
  managementOptionsBox: {
    flex: 0,
    height: 283,
    width: '96%',
    marginLeft: Spacing.one,
    borderRadius: Radius.card,
  },
    personalCareMinHeight: {
    minHeight: 283,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    ...ContentColumn,
    backgroundColor: colors.background,
  },
  scrollContentGrow: {
    flexGrow: 1,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    minWidth: 0
  },
  optionTextColumn: {
    flex: 1,
    minWidth: 0,
  },
  supportingText: {
    color: colors.text,
    ...Typography.caption,
    letterSpacing: 0.4,
  },
  painTrackerRow: {
    height: 56,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  painTrackerRowDivider: {
    borderBottomWidth: 0,
  },
  personalCareRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },

  box: {
    width: 24,
    height: 24,
    borderRadius: Radius.control,
    borderWidth: 2,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  painTrackerBox: {
    width: 18,
    height: 18,
    borderRadius: 2,
    borderColor: colors.outlineStrong,
  },
  checkmark: {
    color: colors.onPrimary,
    ...Typography.bodySmall,
    fontWeight: '700',
  },

  label: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    flexShrink: 1,
    minWidth: 0
  },
  painTrackerLabel: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: colors.text,
  },
  personalCareLabel: {
    lineHeight: 20,
    letterSpacing: 0.25,
  },
}));