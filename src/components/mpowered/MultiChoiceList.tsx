import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChoiceCard } from './ChoiceCard';
import { SearchBar } from './SearchBar';

interface MultiChoiceListProps {
  /** Screen heading, e.g. "Pain location" */
  title: string;
  /** Bold instruction line, e.g. "I have had pain in these areas last week." */
  prompt: string;
  /** Optional italic sub-line under the prompt, e.g. "(scroll down for more options)" */
  subPrompt?: string;
  options: string[];
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
  variant?: 'default' | 'painTracker';
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
  const [internalSelected, setInternalSelected] = useState<number[]>([]);
  const isControlled = selectedIndices !== undefined;
  const selected = isControlled ? selectedIndices : internalSelected;
  const [searchText, setSearchText] = useState('');
  const showSearch = searchEnabled ?? variant === 'painTracker';
  const showScrollable = scrollable ?? variant === 'painTracker';
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

  const fullPrompt = subPrompt ? (
    <>
      <Text style={styles.promptBold}>{prompt}</Text>
      {'\n'}
      <Text style={styles.promptSub}>{subPrompt}</Text>
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
        style={[
          styles.optionsBox,
          showScrollable && styles.scrollableOptionsBox,
          variant === 'painTracker' && styles.painTrackerOptionsBox,
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
  index,
  isSelected,
  isLast,
  onPress,
  variant,
}: {
  option: string;
  index: number;
  isSelected: boolean;
  isLast: boolean;
  onPress: (index: number) => void;
  variant: 'default' | 'painTracker';
}) {
  return (
    <Pressable
      onPress={() => onPress(index)}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={option}
      style={[
        styles.row,
        variant === 'painTracker' && styles.painTrackerRow,
        !isLast && (variant === 'painTracker' ? styles.painTrackerRowDivider : styles.rowDivider),
      ]}
    >
      <Text style={[styles.label, variant === 'painTracker' && styles.painTrackerLabel]}>{option}</Text>
      <View style={[styles.box, variant === 'painTracker' && styles.painTrackerBox, isSelected && styles.boxSelected]}>
        {isSelected && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // The prompt is passed into ChoiceCard's single promptText style, so the
  // bold/sub-line split is handled here with its own text styles instead.
  promptBold: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#1A1A1A',
  },
  promptSub: {
    fontSize: scaleFont(13),
    fontStyle: 'italic',
    fontWeight: '400',
    color: '#6B6B6B',
  },

  // Matches the screenshot: the option rows sit in their own bordered box
  // inside the card, distinct from ChoiceCard's own outer border.
  optionsBox: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: scaleWidth(14),
    width: '100%',
    overflow: 'hidden',
  },
  scrollableOptionsBox: {
    flex: 1,
    minHeight: 0,
  },
  searchInput: {
    marginBottom: scaleHeight(16),
  },
  selectedChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleWidth(16),
    marginBottom: scaleHeight(10),
  },
  selectedChip: {
    minHeight: scaleHeight(30),
    borderWidth: 1,
    borderColor: '#CAC4D0',
    borderRadius: scaleWidth(16),
    backgroundColor: '#EADDFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleWidth(16),
    paddingHorizontal: scaleWidth(16),
  },
  selectedChipText: {
    color: '#49454F',
    fontSize: scaleFont(14),
    fontWeight: '500',
  },
  selectedChipClose: {
    color: '#49454F',
    fontSize: scaleFont(24),
    lineHeight: scaleFont(20),
  },
  painTrackerOptionsBox: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    alignSelf: 'flex-start',
    borderColor: '#E7E0EC',
    borderRadius: scaleWidth(5),
    backgroundColor: '#FEF7FF',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    backgroundColor: '#FEF7FF',
  },
  scrollContentGrow: {
    flexGrow: 1,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(18),
    paddingHorizontal: scaleWidth(18),
    minWidth: 0
  },
  painTrackerRow: {
    height: scaleHeight(56),
    paddingVertical: scaleHeight(8),
    paddingHorizontal: scaleWidth(16),
  },
  painTrackerRowDivider: {
    borderBottomWidth: 0,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  box: {
    width: scaleWidth(24),
    height: scaleWidth(24),
    borderRadius: scaleWidth(6),
    borderWidth: 2,
    borderColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  boxSelected: {
    borderColor: '#5B4A9E',
    backgroundColor: '#5B4A9E',
  },
  painTrackerBox: {
    width: scaleWidth(18),
    height: scaleWidth(18),
    borderRadius: scaleWidth(2),
    borderColor: '#49454F',
  },
  checkmark: {
    color: 'white',
    fontSize: scaleFont(14),
    fontWeight: '700',
  },

  label: {
    fontSize: scaleFont(16),
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    flexShrink: 1,
    minWidth: 0
  },
  painTrackerLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: '#1D1B20',
  },
});