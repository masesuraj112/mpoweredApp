import { ScoreThresholds } from '@/constants/scoring-thresholds';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { ChoiceCard } from './ChoiceCard';
import { useKeyboardDoneBar } from './KeyboardDoneBar';

import { makeStyles, Palette, Radius, Spacing, Typography, useThemeColors } from '@/constants/theme';
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
  cardHeight?: number;
  variant?: 'default' | 'painTracker' | 'personalCare';
}

function getScoreDescription(assessmentType: string | undefined, value: number): string | undefined {
  if (!assessmentType || !(assessmentType in ScoreThresholds)) {
    return undefined;
  }
  const thresholds = ScoreThresholds[assessmentType as keyof typeof ScoreThresholds];
  return thresholds[value as keyof typeof thresholds] as string | undefined;
}

const ROW_HEIGHT = 90;
const TRACK_HEIGHT = 32;
const THUMB_HEIGHT = 70;

// Thumb width is derived as a ratio of the slider's own width (90% of the 412px
// Figma base), not the full screen — stays proportional to the slider itself
// regardless of how much of the screen the slider occupies.
const THUMB_WIDTH_RATIO = 9.5 / (412 * 0.9);

// Interpolates from a lighter purple to near-black as value increases (0–10)
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

function getGradientColors(value: number, startColor: string): [string, string] {
  const t = value / 10;
  const endColor = interpolateColor(Palette.lavenderSoft, Palette.midnight, t);
  return [startColor, endColor];
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
  cardHeight,
  variant = 'default',

}: ScaleSliderProps) {
  const stylesSheet = useStylesSheet();
  const sliderSheet = useSliderSheet();
  const personalCareSheet = usePersonalCareSheet();
  const colors = useThemeColors();
  const [value, setValue] = useState(initialValue ?? 0);
  // Tracks whether a score has been entered so the input can show its placeholder.
  const [hasValue, setHasValue] = useState(initialValue !== undefined);
  const isPersonalCare = variant === 'personalCare';
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

  const thumbWidth = sliderWidth ? sliderWidth * THUMB_WIDTH_RATIO : 10;
  const thumbGap = thumbWidth / 2;
  const fillWidth = (value / 10) * sliderWidth;

  const prompt = isPersonalCare ? (
    <View>
      {questionText && <Text style={personalCareSheet.questionText}>{questionText}</Text>}
      <View style={personalCareSheet.scoreRow}>
        <Text style={personalCareSheet.scoreLabel}>My score is</Text>
        <TextInput
          style={personalCareSheet.scoreInput}
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
  ) : (
    <Text style={stylesSheet.painLevelText}>
      My <Text style={{ textDecorationLine: 'underline' }}>{underLinedText}</Text> is
      <TextInput
        style={stylesSheet.underlineText}
        keyboardType="number-pad"
        inputAccessoryViewID={doneBar.id}
        value={hasValue ? String(value) : ''}
        onChangeText={changeNumber}
      />
    </Text>
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
      cardHeight={cardHeight}
      variant={variant}
    >
      <View
        style={sliderSheet.container}
        onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width)}
      >
        {/* Value bubble */}
        <View
          style={[
            sliderSheet.bubble,
            { left: (value / 10) * sliderWidth - 15 },
          ]}
        >
          <Text style={sliderSheet.bubbleText}>{value}</Text>
        </View>

        {/* Custom track — background */}
        <View style={sliderSheet.trackBackground} />

        {/* Custom track — filled portion, gradient darkens as value increases */}
        <LinearGradient
          colors={getGradientColors(value, colors.onBrandMuted)}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            sliderSheet.trackFill,
            { width: Math.max(0, fillWidth - thumbGap) },
          ]}
        />

        {/* Custom thumb — sharp-cornered rectangle */}
        <View
          pointerEvents="none"
          style={[
            sliderSheet.rectThumb,
            { left: fillWidth - thumbWidth / 2, width: thumbWidth },
          ]}
        />

        {/* Invisible native slider — handles touch/drag only */}
        <Slider
          style={sliderSheet.slider}
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={handleSliderChange}
          minimumTrackTintColor="transparent"
          maximumTrackTintColor="transparent"
          thumbTintColor="transparent"
        />
      </View>

      <Text style={isPersonalCare ? personalCareSheet.descriptionText : stylesSheet.descriptionText}>
        {getScoreDescription(assessmentType, value)}
      </Text>
      {doneBar.bar}
    </ChoiceCard>
  );
}

const useStylesSheet = makeStyles((colors) => ({
  painLevelText: {
    color: colors.text,
    ...Typography.titleSmall,
  },
  underlineText: {
    color: colors.text,
    ...Typography.titleSmall,
    borderBottomWidth: 2,
    width: 30,
    borderBottomColor: colors.text,
    minWidth: 10,
    textAlign: 'center',
    paddingBottom: Spacing.one,
    marginLeft: Spacing.two,
  },
  descriptionText: {
    color: colors.text,
    marginTop: Spacing.two,
    ...Typography.bodyLarge,
    fontWeight: '700',
    fontStyle: 'italic',
  },
}));

const usePersonalCareSheet = makeStyles((colors) => ({
  questionText: {
    ...Typography.caption,
    fontWeight: '500',
    letterSpacing: 0.5,
    color: colors.text,
    marginBottom: Spacing.three,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  scoreLabel: {
    ...Typography.bodySmall,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: colors.text,
  },
  scoreInput: {
    width: 64,
    ...Typography.bodySmall,
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
    color: colors.text,
    borderBottomWidth: 2,
    borderBottomColor: colors.outlineStrong,
    paddingVertical: Spacing.half,
  },
  descriptionText: {
    marginTop: Spacing.one,
    ...Typography.caption,
    fontWeight: '600',
    fontStyle: 'italic',
    letterSpacing: 0.5,
    textAlign: 'center',
    color: colors.text,
  },
}));

const useSliderSheet = makeStyles((colors) => ({
  container: {
    width: '90%',
    height: ROW_HEIGHT,
    justifyContent: 'center',
    alignSelf: 'center',
    minWidth: 0,
  },
  slider: {
    width: '100%',
    height: ROW_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  trackBackground: {
    position: 'absolute',
    top: (ROW_HEIGHT - TRACK_HEIGHT) / 2,
    left: 0,
    width: '100%',
    height: TRACK_HEIGHT,
    backgroundColor: colors.surfaceContainer,
    borderRadius: TRACK_HEIGHT / 2,
  },
  trackFill: {
    position: 'absolute',
    top: (ROW_HEIGHT - TRACK_HEIGHT) / 2,
    left: 0,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
  },
  bubble: {
    position: 'absolute',
    top: -30,
    backgroundColor: colors.primary,
    borderRadius: Radius.control,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    zIndex: 3,
  },
  bubbleText: {
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  rectThumb: {
    position: 'absolute',
    top: (ROW_HEIGHT - THUMB_HEIGHT) / 2,
    height: THUMB_HEIGHT,
    backgroundColor: colors.primary,
    borderRadius: 0,
    zIndex: 2,
  },
}));
