import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useKeyboardDoneBar } from '@/components/mpowered/KeyboardDoneBar';
import { AppText } from '@/components/ui/AppText';
import { ScoreThresholds } from '@/constants/scoring-thresholds';
import { Colors, MinTapTarget, Radius, Spacing, Typography } from '@/constants/theme';

import { ChoiceCard, type ChoiceCardVariant } from './ChoiceCard';

type ScaleSliderInputProps = {
  titleText: string;
  underLinedText?: string;
  /** Question shown above the score input (not the pain tracker). */
  questionText?: string;
  questionNumber?: number;
  totalQuestions?: number;
  assessmentType?: string;
  onValueChange?: (value: number) => void;
  onRecord?: () => void;
  onPrevious?: () => void;
  disabled?: boolean;
  /** Red text shown inside the card, above the footer buttons. */
  validationMessage?: string;
  /** Leave undefined to show the "0 to 10" placeholder until the user answers. */
  initialValue?: number;
  variant?: ChoiceCardVariant;
};

function getScoreDescription(assessmentType: string | undefined, value: number): string | undefined {
  if (!assessmentType || !(assessmentType in ScoreThresholds)) {
    return undefined;
  }
  const thresholds = ScoreThresholds[assessmentType as keyof typeof ScoreThresholds];
  return thresholds[value as keyof typeof thresholds] as string | undefined;
}

const SLIDER_HEIGHT = 90;
const TRACK_HEIGHT = 32;
const THUMB_HEIGHT = 70;
const THUMB_WIDTH = 10;
const BUBBLE_HALF_WIDTH = 15;
const BUBBLE_OFFSET = -30;

// Interpolates from a lighter purple to near-black as value increases (0 to 10).
function hexToRgb(hex: string) {
  const bigint = parseInt(hex.replace('#', ''), 16);
  return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
}

function interpolateColor(from: string, to: string, t: number): string {
  const f = hexToRgb(from);
  const tRgb = hexToRgb(to);
  const r = Math.round(f.r + (tRgb.r - f.r) * t);
  const g = Math.round(f.g + (tRgb.g - f.g) * t);
  const b = Math.round(f.b + (tRgb.b - f.b) * t);
  return `rgb(${r}, ${g}, ${b})`;
}

function getGradientColors(value: number): [string, string] {
  const start = Colors.light.sliderFillStart;
  return [start, interpolateColor(start, Colors.light.sliderFillEnd, value / 10)];
}

/** A 0 to 10 score question: a number box and a slider that stay in step, with the score's meaning below. */
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
  disabled = false,
  validationMessage,
  initialValue,
  variant = 'personalCare',
}: ScaleSliderInputProps) {
  const [value, setValue] = useState(initialValue ?? 0);
  // Tracks whether a score has been entered so the input can show its placeholder.
  const [hasValue, setHasValue] = useState(initialValue !== undefined);
  const isPainTracker = variant === 'painTracker';
  const [sliderWidth, setSliderWidth] = useState(0);
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

  const thumbGap = THUMB_WIDTH / 2;
  const fillWidth = (value / 10) * sliderWidth;

  const prompt = isPainTracker ? (
    <Text style={styles.painLevelText}>
      My <Text style={styles.underlined}>{underLinedText}</Text> is
      <TextInput
        style={styles.painLevelInput}
        keyboardType="number-pad"
        inputAccessoryViewID={doneBar.id}
        accessibilityLabel={`My ${underLinedText} from 0 to 10`}
        value={hasValue ? String(value) : ''}
        onChangeText={changeNumber}
      />
    </Text>
  ) : (
    <View>
      {questionText ? (
        <AppText variant="labelMedium" color="text" style={styles.questionText}>
          {questionText}
        </AppText>
      ) : null}
      <View style={styles.scoreRow}>
        <AppText variant="labelLargeBold" color="onSurface">
          My score is
        </AppText>
        <TextInput
          style={styles.scoreInput}
          keyboardType="number-pad"
          // The iOS number pad has no return key, so this Done bar is the only way to close it.
          inputAccessoryViewID={doneBar.id}
          accessibilityLabel="My score from 0 to 10"
          placeholder="0 to 10"
          placeholderTextColor={Colors.light.textDisabled}
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
      disabled={disabled}
      validationMessage={validationMessage}
      variant={variant}>
      <View style={styles.slider} onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}>
        {/* Value bubble */}
        <View style={[styles.bubble, { left: fillWidth - BUBBLE_HALF_WIDTH }]}>
          <AppText variant="labelLargeBold" color="onPrimary">
            {value}
          </AppText>
        </View>

        {/* Custom track: background */}
        <View style={styles.trackBackground} />

        {/* Custom track: filled portion, the gradient darkens as the value increases */}
        <LinearGradient
          colors={getGradientColors(value)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.trackFill, { width: Math.max(0, fillWidth - thumbGap) }]}
        />

        {/* Custom thumb: sharp-cornered rectangle */}
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: fillWidth - THUMB_WIDTH / 2, width: THUMB_WIDTH }]}
        />

        {/* Invisible native slider: handles touch and drag only */}
        <Slider
          style={styles.nativeSlider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={handleSliderChange}
          accessibilityLabel={`${underLinedText ?? 'Score'} slider`}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="transparent"
        />
      </View>

      <AppText
        variant={isPainTracker ? 'titleMedium' : 'labelLargeBold'}
        color="text"
        style={[styles.description, !isPainTracker && styles.descriptionCentred]}>
        {getScoreDescription(assessmentType, value)}
      </AppText>
      {doneBar.bar}
    </ChoiceCard>
  );
}

const styles = StyleSheet.create({
  painLevelText: {
    ...Typography.titleLarge,
    color: Colors.light.text,
  },
  underlined: {
    textDecorationLine: 'underline',
  },
  painLevelInput: {
    ...Typography.titleLarge,
    minWidth: Spacing.five,
    marginLeft: Spacing.two,
    paddingBottom: Spacing.one,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.text,
    textAlign: 'center',
    color: Colors.light.text,
  },
  questionText: {
    marginBottom: Spacing.mid,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.mid,
  },
  scoreInput: {
    ...Typography.labelLarge,
    minWidth: Spacing.six,
    minHeight: MinTapTarget,
    textAlign: 'center',
    color: Colors.light.onSurface,
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.onSurfaceVariant,
  },
  description: {
    marginTop: Spacing.two,
    fontStyle: 'italic',
  },
  descriptionCentred: {
    textAlign: 'center',
  },
  slider: {
    width: '90%',
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 0,
  },
  nativeSlider: {
    width: '100%',
    height: SLIDER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  trackBackground: {
    position: 'absolute',
    top: (SLIDER_HEIGHT - TRACK_HEIGHT) / 2,
    left: 0,
    width: '100%',
    height: TRACK_HEIGHT,
    backgroundColor: Colors.light.sliderTrack,
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackFill: {
    position: 'absolute',
    top: (SLIDER_HEIGHT - TRACK_HEIGHT) / 2,
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  bubble: {
    position: 'absolute',
    top: BUBBLE_OFFSET,
    paddingHorizontal: Spacing.mid,
    paddingVertical: Spacing.one,
    backgroundColor: Colors.light.controlChecked,
    borderRadius: Radius.control,
    zIndex: 3,
  },
  thumb: {
    position: 'absolute',
    top: (SLIDER_HEIGHT - THUMB_HEIGHT) / 2,
    height: THUMB_HEIGHT,
    backgroundColor: Colors.light.controlChecked,
    zIndex: 2,
  },
});
