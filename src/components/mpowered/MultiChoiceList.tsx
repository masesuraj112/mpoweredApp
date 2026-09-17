import { scaleFont, scaleHeight, scaleWidth} from '@/services/scale';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChoiceCard } from './ChoiceCard';

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
  questionNumber?: number;
  totalQuestions?: number;
  onRecord?: () => void;
}

export function MultiChoiceList({
  title,
  prompt,
  subPrompt,
  options,
  selectedIndices,
  onSelectionChange,
  questionNumber,
  totalQuestions,
  onRecord,
}: MultiChoiceListProps) {
  const [internalSelected, setInternalSelected] = useState<number[]>([]);
  const isControlled = selectedIndices !== undefined;
  const selected = isControlled ? selectedIndices : internalSelected;

  const toggle = (index: number) => {
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
    >
      <View style={styles.optionsBox}>
        {options.map((option, index) => {
          const isSelected = selected.includes(index);
          const isLast = index === options.length - 1;

          return (
            <Pressable
              key={index}
              onPress={() => toggle(index)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={option}
              style={[styles.row, !isLast && styles.rowDivider]}
            >
              <Text style={styles.label}>{option}</Text>
              <View style={[styles.box, isSelected && styles.boxSelected]}>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ChoiceCard>
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

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleHeight(18),
    paddingHorizontal: scaleWidth(18),
    minWidth: 0
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
});