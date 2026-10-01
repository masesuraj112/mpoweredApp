import { ScoreThresholds } from '@/constants/scoring-thresholds';
import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import Slider from '@react-native-community/slider';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ChoiceCard } from './ChoiceCard';

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

const ROW_HEIGHT = scaleHeight(90);
const TRACK_HEIGHT = scaleHeight(32);
const THUMB_HEIGHT = scaleHeight(70);

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

function getGradientColors(value: number): [string, string] {
  const t = value / 10;
  const startColor = '#8B7BC7';
  const endColor = interpolateColor('#8B7BC7', '#1A1330', t);
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
  initialValue,
  cardHeight,
  variant = 'default',

}: ScaleSliderProps) {
  const [value, setValue] = useState(initialValue ?? 0);
  // Tracks whether a score has been entered so the input can show its placeholder.
  const [hasValue, setHasValue] = useState(initialValue !== undefined);
  const isPersonalCare = variant === 'personalCare';
  const [sliderWidth, setSliderWidth] = useState(0);

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
    const clamped = Math.min(10, Math.max(0, num));
    setValue(clamped);
    setHasValue(true);
    onValueChange?.(clamped);
  };

  const handleSliderChange = (val: number) => {
    setValue(val);
    setHasValue(true);
    onValueChange?.(val);
  };

  const thumbWidth = sliderWidth ? sliderWidth * THUMB_WIDTH_RATIO : scaleWidth(9.5);
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
          placeholder="0 to 10"
          placeholderTextColor="rgba(0, 0, 0, 0.19)"
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
            { left: (value / 10) * sliderWidth - scaleWidth(15) },
          ]}
        >
          <Text style={sliderSheet.bubbleText}>{value}</Text>
        </View>

        {/* Custom track — background */}
        <View style={sliderSheet.trackBackground} />

        {/* Custom track — filled portion, gradient darkens as value increases */}
        <LinearGradient
          colors={getGradientColors(value)}
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
    </ChoiceCard>
  );
}

const stylesSheet = StyleSheet.create({
  painLevelText: {
    fontSize: scaleFont(20),
    fontWeight: '700',
  },
  underlineText: {
    fontSize: scaleFont(20),
    fontWeight: '700',
    borderBottomWidth: 2,
    width: scaleWidth(30),
    borderBottomColor: 'black',
    minWidth: scaleWidth(10),
    textAlign: 'center',
    paddingBottom: scaleHeight(4),
    marginLeft: scaleWidth(8),
  },
  descriptionText: {
    marginTop: scaleHeight(10),
    fontSize: scaleFont(17),
    fontWeight: '700',
    fontStyle: 'italic',
  },
});

const personalCareSheet = StyleSheet.create({
  questionText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
    color: '#000000',
    marginBottom: scaleHeight(14),
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleWidth(13),
  },
  scoreLabel: {
    fontSize: scaleFont(14),
    fontWeight: '600',
    lineHeight: scaleHeight(20),
    letterSpacing: 0.1,
    color: '#1D1B20',
  },
  scoreInput: {
    width: scaleWidth(64),
    fontSize: scaleFont(14),
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
    color: '#1D1B20',
    borderBottomWidth: 2,
    borderBottomColor: '#49454F',
    paddingVertical: scaleHeight(2),
  },
  descriptionText: {
    marginTop: scaleHeight(4),
    fontSize: scaleFont(13),
    fontWeight: '600',
    fontStyle: 'italic',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
    textAlign: 'center',
    color: '#000000',
  },
});

const sliderSheet = StyleSheet.create({
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
    backgroundColor: '#E4DFF5',
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
    top: scaleHeight(-30),
    backgroundColor: '#5B4A9E',
    borderRadius: scaleWidth(10),
    paddingHorizontal: scaleWidth(10),
    paddingVertical: scaleHeight(4),
    zIndex: 3,
  },
  bubbleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rectThumb: {
    position: 'absolute',
    top: (ROW_HEIGHT - THUMB_HEIGHT) / 2,
    height: THUMB_HEIGHT,
    backgroundColor: '#5B4A9E',
    borderRadius: 0,
    zIndex: 2,
  },
});
