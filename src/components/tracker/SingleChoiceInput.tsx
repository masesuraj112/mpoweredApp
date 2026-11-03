import { useState } from 'react';


import { ChoiceCard, type ChoiceCardVariant } from './ChoiceCard';
import { ChoiceOptionList } from './ChoiceOptionList';
import { ChoicePrompt, PromptEmphasis } from './ChoicePrompt';
import { RadioOptionRow } from './RadioOptionRow';

type SingleChoiceInputProps = {
  titleText: string;
  questionNumber?: number;
  totalQuestions?: number;
  options?: string[];
  onRecord?: () => void;
  onSelectionChange?: (selectedIndex: number) => void;
  onPrevious?: () => void;
  variant?: ChoiceCardVariant;
  /** Pass to control the choice from the parent (for example to restore a saved answer). */
  selectedIndex?: number | null;
};

/** A pick-one question: the "MOST relevant statement" prompt and a list of radio options. */
export function SingleChoiceInput({
  titleText,
  questionNumber,
  totalQuestions,
  options,
  onRecord,
  onSelectionChange,
  onPrevious,
  variant = 'personalCare',
  selectedIndex: controlledSelectedIndex,
}: SingleChoiceInputProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentSelectedIndex = controlledSelectedIndex !== undefined ? controlledSelectedIndex : selectedIndex;

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange?.(index);
  };

  const prompt = (
    <ChoicePrompt>
      Select the <PromptEmphasis>MOST</PromptEmphasis> relevant statement:
    </ChoicePrompt>
  );

  return (
    <ChoiceCard
      title={titleText}
      prompt={prompt}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onRecord={onRecord}
      onPrevious={onPrevious}
      disabled={currentSelectedIndex === null}
      variant={variant}>
      <ChoiceOptionList>
        {options?.map((option, index) => (
          <RadioOptionRow
            key={index}
            label={option}
            selected={index === currentSelectedIndex}
            isLast={index === options.length - 1}
            onPress={() => handleSelect(index)}
          />
        ))}
      </ChoiceOptionList>
    </ChoiceCard>
  );
}
