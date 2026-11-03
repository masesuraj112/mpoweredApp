import { ScoreThresholds } from '@/constants/scoring-thresholds';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { NativeSlider } from '@/components/ui/NativeSlider';

import { ChoiceCard, QuestionPrompt } from './ChoiceCard';
import { useInputStyles } from './inputStyles';
import { useKeyboardDoneBar } from './KeyboardDoneBar';

import { makeStyles, Spacing, Typography, useThemeColors } from '@/constants/theme';
interface ScaleSliderProps {
  titleText: string;
  underLinedText?: string;
  /** Question shown above the score input (personalCare variant). */
  questionText?: string;
  bottomDescription?: string;
  questionNumber?: number;
  totalQuestions?: number;
  assessmentType?: string;
  onValueChange?: (value: number) => void;
  onRecord?: () => void;
  onPrevious?: () => void;
  previousDisabled?: boolean;
  disabled?: boolean;
  /** Red text shown inside the card, above the footer buttons. */
  validationMessage?: string;
  /** Leave undefined to show the "0 to 10" placeholder until the user answers. */
  initialValue?: number;
  variant?: 'default' | 'painTracker' | 'personalCare';
}

function getScoreDescription(assessmentType: string | undefined, value: number): string | undefined {
  if (!assessmentType || !(assessmentType in ScoreThresholds)) {
    return undefined;
  }
  const thresholds = ScoreThresholds[assessmentType as keyof typeof ScoreThresholds];
  return thresholds[value as keyof typeof thresholds] as string | undefined;
}




export function ScaleSliderInput({
  titleText,
  underLinedText,
  questionText,
  questionNumber,
  totalQuestions,
  assessmentType,
  onValueChange,
  onRecord,
  onPrevious,
  previousDisabled = false,
  disabled = false,
  validationMessage,
  initialValue,
  variant = 'default',
}: ScaleSliderProps) {
  const styles = useStyles();
  const inputStyles = useInputStyles();
  const colors = useThemeColors();
  const [value, setValue] = useState(initialValue ?? 0);
  // Tracks whether a score has been entered so the input can show its placeholder.
  const [hasValue, setHasValue] = useState(initialValue !== undefined);
  const doneBar = useKeyboardDoneBar();

  // This function prevents input from being less than 0 or greater than 10
  const changeNumber = (text: string) => {
    if (text === '') {
      setValue(0);
      setHasValue(false);
      onValueChange?.(0);
      return;
    }
    const num = Number(text);
    if (isNaN(num)) return;
    const clamped = Math.round(Math.min(10, Math.max(0, num)));
    setValue(clamped);
    setHasValue(true);
    onValueChange?.(clamped);
  };

  const handleSliderChange = (val: number) => {
    setValue(val);
    setHasValue(true);
    onValueChange?.(val);
  };


  // Every score question reads the same: the question (if any), then "My … is" and the score box.
  const prompt = (
    <View style={styles.prompt}>
      {questionText && <QuestionPrompt>{questionText}</QuestionPrompt>}
      <View style={styles.scoreRow}>
        <QuestionPrompt>
          {underLinedText ? (
            <>
              My <Text style={{ textDecorationLine: 'underline' }}>{underLinedText}</Text> is
            </>
          ) : (
            'My score is'
          )}
        </QuestionPrompt>
        <TextInput
          style={[inputStyles.input, styles.scoreInput]}
          accessibilityLabel={underLinedText ? `My ${underLinedText}, 0 to 10` : 'My score, 0 to 10'}
          keyboardType="number-pad"
          // The iOS number pad has no return key, so this Done bar is the only way to close it.
          inputAccessoryViewID={doneBar.id}
          placeholder="0 to 10"
          placeholderTextColor={colors.textSubtle}
          value={hasValue ? String(value) : ''}
          onChangeText={changeNumber}
        />
      </View>
    </View>
  );

  return (
    <ChoiceCard
      title={titleText}
      prompt={prompt}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onRecord={onRecord}
      onPrevious={onPrevious}
      previousDisabled={previousDisabled}
      disabled={disabled}
      validationMessage={validationMessage}
      variant={variant}
    >
      <View style={styles.slider}>
        <NativeSlider
          value={value}
          onValueChange={(next) => handleSliderChange(Math.round(next))}
          min={0}
          max={10}
          step={1}
          accessibilityLabel={underLinedText ? `My ${underLinedText}, 0 to 10` : 'My score, 0 to 10'}
          disabled={disabled}
        />
        {/* The ends of the scale, so the slider reads as 0 to 10 without a bubble over it. */}
        <View style={styles.scaleEnds} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text style={styles.scaleEnd}>0</Text>
          <Text style={styles.scaleEnd}>10</Text>
        </View>
      </View>

      <Text style={styles.descriptionText}>
        {getScoreDescription(assessmentType, value)}
      </Text>
      {doneBar.bar}
    </ChoiceCard>
  );
}

const useStyles = makeStyles((colors) => ({
  prompt: {
    gap: Spacing.three,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  scoreInput: {
    minWidth: 104,
    textAlign: 'center',
  },
  slider: {
    gap: Spacing.one,
  },
  scaleEnds: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scaleEnd: {
    ...Typography.caption,
    color: colors.textSecondary,
  },
  descriptionText: {
    ...Typography.bodyLarge,
    fontStyle: 'italic',
    textAlign: 'center',
    color: colors.textSecondary,
  },
}));

