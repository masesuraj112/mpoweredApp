import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';


interface PainSliderProps {
  painLevel?: string;
  painDescription?: string;
  onValueChange?: (value: number) => void;
}

const ROW_HEIGHT = 56;      // height of the interactive row (increased for taller thumb)
const TRACK_HEIGHT = 20;    // thickness of the visible track
const THUMB_WIDTH = 14;     // width of the pill-shaped thumb
const THUMB_HEIGHT = 44;    // height of the pill-shaped thumb

export function PainSliderInput({ painLevel, painDescription, onValueChange }: PainSliderProps) {
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

        {/* Custom pill-shaped thumb */}
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
      <Text>The pain is {painDescription}</Text>
    </View>
  );
}

const stylesSheet = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black',
    borderRadius: 15,
    alignItems: 'center',
    paddingTop: 20,        // ← space between the card's top border and its content
    paddingHorizontal: 15, // keeps left/right inset consistent
    paddingBottom: 15,
  },

  titleText: {
    marginBottom: 15,
    alignSelf: 'flex-start',
  },

  lineText: {
    borderTopWidth: 1,
    borderTopColor: 'gray',
    width: '100%',
    marginBottom: 15,
  },
  painLevelText: {
    margin: 15,
    marginBottom: 35, // extra room so the value bubble doesn't overlap this text
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  underlineText: {
    fontSize: 20,
    borderBottomWidth: 2,
    width: 30,
    borderBottomColor: 'black',
    minWidth: 10,
    textAlign: 'center',
    paddingBottom: 4,
    marginLeft: 8,
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
    borderRadius: 0, // fully rounded ends, pill-shaped
    zIndex: 2,
  },
});