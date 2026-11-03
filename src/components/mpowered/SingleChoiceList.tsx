import { useState } from 'react';
import { Text } from 'react-native';
import { ChoiceCard, QuestionPrompt } from './ChoiceCard';
import { ChoiceList, ChoiceRow } from './ChoiceRow';

interface SingleChoiceProps {
  titleText: string;
  questionNumber?: number;
  totalQuestions?: number;
  options?: string[];
  onRecord?: () => void;
  onSelectionChange?: (selectedIndex: number) => void;
  onPrevious?: () => void;
  previousDisabled?: boolean;
  variant?: 'default' | 'painTracker' | 'personalCare';
  selectedIndex?: number | null;
}

/** A pick-one question: "Select the MOST relevant statement", then its options. */
export function SingleChoiceInput({
  titleText,
  questionNumber,
  totalQuestions,
  options,
  onRecord,
  onSelectionChange,
  onPrevious,
  previousDisabled = false,
  variant = 'default',
  selectedIndex: controlledSelectedIndex,
}: SingleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentSelectedIndex = controlledSelectedIndex !== undefined ? controlledSelectedIndex : selectedIndex;

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange?.(index);
  };

  return (
    <ChoiceCard
      title={titleText}
      prompt={
        <QuestionPrompt>
          Select the <Text style={{ textDecorationLine: 'underline' }}>MOST</Text> relevant statement:
        </QuestionPrompt>
      }
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onRecord={onRecord}
      onPrevious={onPrevious}
      previousDisabled={previousDisabled}
      disabled={currentSelectedIndex === null}
      variant={variant}>
      <ChoiceList>
        {options?.map((option, index) => (
          <ChoiceRow
            key={index}
            kind="radio"
            label={option}
            selected={index === currentSelectedIndex}
            onPress={() => handleSelect(index)}
            isLast={index === options.length - 1}
          />
        ))}
      </ChoiceList>
    </ChoiceCard>
  );
}
