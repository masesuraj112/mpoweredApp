import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';


interface PainSliderProps {
  painLevel?: string;
  painDescription?: string;
  questionNumber?: number;
  onValueChange?: (value: number) => void;
  onRecord?: () => void;
}

const ROW_HEIGHT = 56;      // height of the interactive row (increased for taller thumb)
const TRACK_HEIGHT = 20;    // thickness of the visible track
const THUMB_WIDTH = 14;     // width of the thumb
const THUMB_HEIGHT = 44;    // height of the thumb

export function PainSliderInput({
  painLevel,
  painDescription,
  questionNumber,
  onValueChange,
  onRecord,
}: PainSliderProps) {
  const [value, setValue] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);

  // This function prevents input from being less than 0 or greater than 10
  const changeNumber = (text: string) => {
    const num = Number(text);
    if (isNaN(num)) return;
    const clamped = Math.min(10, Math.max(0, num));
    setValue(clamped);
    onValueChange?.(clamped);
  };

  const handleSliderChange = (val: number) => {
    setValue(val);
    onValueChange?.(val);
  };

  const fillWidth = (value / 10) * sliderWidth;

  return (
    <View style={stylesSheet.container}>
      <Text style={stylesSheet.titleText}>Pain Intensity</Text>
      <Text style={stylesSheet.lineText}></Text>
      <Text style={stylesSheet.painLevelText}>
        My {painLevel} pain is{' '}
        <TextInput
          style={stylesSheet.underlineText}
          keyboardType="number-pad"
          value={String(value)}
          onChangeText={changeNumber}
        />
      </Text>

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

        {/* Custom track — filled portion */}
        <View style={[sliderSheet.trackFill, { width: fillWidth }]} />

        {/* Custom thumb — sharp-cornered rectangle */}
        <View
          pointerEvents="none"
          style={[
            sliderSheet.rectThumb,
            { left: fillWidth - THUMB_WIDTH / 2 },
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
          thumbTintColor="#E4DFF5" // blends native thumb into the light track color instead of a stray dot
        />
      </View>

      <Text style={stylesSheet.descriptionText}>The pain is {painDescription}</Text>

      {/* Footer: page indicator + Record button */}
      <View style={footerStyles.row}>
        <View style={footerStyles.pill}>
          <Text style={footerStyles.pillText}>
            {questionNumber ?? 1}/{6}
          </Text>
        </View>

        <Pressable
          onPress={onRecord}
          style={({ pressed }) => [
            footerStyles.pill,
            footerStyles.recordButton,
            pressed && footerStyles.recordButtonPressed,
          ]}
        >
          <Text style={footerStyles.pillText}>Record</Text>
          <Text style={footerStyles.arrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const stylesSheet = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black',
    borderRadius: 20,
    alignItems: 'center',
    paddingTop: 24,        // ← space between the card's top border and its content
    paddingHorizontal: 20, // keeps left/right inset consistent
    paddingBottom: 20,
  },

  titleText: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },

  lineText: {
    borderTopWidth: 1,
    borderTopColor: 'black',
    width: '100%',
    marginBottom: 15,
  },
  painLevelText: {
    margin: 15,
    marginBottom: 35, // extra room so the value bubble doesn't overlap this text
    fontSize: 20,
    fontWeight: '700',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  underlineText: {
    fontSize: 20,
    fontWeight: '700',
    borderBottomWidth: 2,
    width: 30,
    borderBottomColor: 'black',
    minWidth: 10,
    textAlign: 'center',
    paddingBottom: 4,
    marginLeft: 8,
  },
  descriptionText: {
    marginTop: 10,
    fontSize: 17,
    fontWeight: '700',
    fontStyle: 'italic',
  },
});


const sliderSheet = StyleSheet.create({
  container: {
    width: '30%',
    height: ROW_HEIGHT,
    justifyContent: 'center',
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
    backgroundColor: '#5B4A9E',
    borderRadius: TRACK_HEIGHT / 2,
  },
  bubble: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#5B4A9E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 3,
  },
  bubbleText: {
    color: 'white',
    fontWeight: 'bold',
  },
  rectThumb: {
    position: 'absolute',
    top: (ROW_HEIGHT - THUMB_HEIGHT) / 2,
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    backgroundColor: '#5B4A9E',
    borderRadius: 0, // sharp corners
    zIndex: 2,
  },
});

const footerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  pill: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    gap: 8,
  },
  recordButtonPressed: {
    backgroundColor: '#F2F2F5',
  },
  pillText: {
    fontSize: 18,
    fontWeight: '400',
    color: 'black', 
  },
  arrow: {
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
  },
});